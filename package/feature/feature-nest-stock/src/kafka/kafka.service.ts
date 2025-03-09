import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EachMessagePayload, Kafka, Producer, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);

  private kafka = new Kafka({
    brokers: ['localhost:9094'],
    clientId: 'koi_kafka',
  });

  private producer: Producer;

  private consumer: Consumer;

  private isProducerConnected = false;

  private isConsumerConnected = false;

  private readonly maxRetries = 3;

  private readonly retryDelay = 1000; // ms

  constructor() {
    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 30000,
    });

    this.consumer = this.kafka.consumer({
      groupId: 'stock_service_group',
      heartbeatInterval: 3000,
      sessionTimeout: 30000,
    });
  }

  /**
   * NestJS 라이프사이클 훅 - 모듈이 초기화될 때 자동으로 호출됩니다.
   */
  async onModuleInit(): Promise<void> {
    await this.connectConsumer();
    await this.consumer.subscribe({ topics: ['stock.transaction.topic'] });
    await this.consumer.run({
      autoCommitInterval: 5000,
      autoCommitThreshold: 100,
      eachMessage: this.consumerCallback,
    });
    this.logger.log('Kafka 컨슈머가 초기화되었고 토픽 구독을 시작했습니다.');
  }

  /**
   * NestJS 라이프사이클 훅 - 모듈이 종료될 때 자동으로 호출됩니다.
   */
  async onModuleDestroy(): Promise<void> {
    await this.disconnectProducer();
    await this.disconnectConsumer();
    this.logger.log('Kafka 연결이 안전하게 종료되었습니다.');
  }

  /**
   * Kafka 메시지 수신 콜백 함수
   */
  async consumerCallback(payload: EachMessagePayload): Promise<void> {
    try {
      const messageValue = payload.message.value?.toString() || '';
      this.logger.debug(`Kafka 메시지 수신: ${payload.topic} - ${messageValue}`);

      // 여기에 메시지 처리 로직 추가
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Kafka 메시지 처리 중 오류 발생: ${errorMessage}`, errorStack);
    }
  }

  /**
   * 추가 토픽 구독 설정
   */
  async addSubscriptionTopic(topic: string): Promise<void> {
    try {
      await this.consumer.pause([{ topic }]);
      await this.consumer.subscribe({ topic });
      await this.consumer.resume([{ topic }]);
      this.logger.log(`토픽 '${topic}'에 대한 구독을 추가했습니다.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`토픽 '${topic}' 구독 중 오류 발생: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * Producer 연결 관리 - 연결이 없으면 연결 수립
   */
  private async connectProducer(): Promise<void> {
    if (!this.isProducerConnected) {
      try {
        await this.producer.connect();
        this.isProducerConnected = true;
        this.logger.debug('Kafka 프로듀서 연결 성공');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        const errorStack = error instanceof Error ? error.stack : undefined;
        this.logger.error(`Kafka 프로듀서 연결 실패: ${errorMessage}`, errorStack);
        throw error;
      }
    }
  }

  /**
   * Consumer 연결 관리 - 연결이 없으면 연결 수립
   */
  private async connectConsumer(): Promise<void> {
    if (!this.isConsumerConnected) {
      try {
        await this.consumer.connect();
        this.isConsumerConnected = true;
        this.logger.debug('Kafka 컨슈머 연결 성공');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        const errorStack = error instanceof Error ? error.stack : undefined;
        this.logger.error(`Kafka 컨슈머 연결 실패: ${errorMessage}`, errorStack);
        throw error;
      }
    }
  }

  /**
   * Producer 연결 종료
   */
  private async disconnectProducer(): Promise<void> {
    if (this.isProducerConnected) {
      try {
        await this.producer.disconnect();
        this.isProducerConnected = false;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        const errorStack = error instanceof Error ? error.stack : undefined;
        this.logger.error(`Kafka 프로듀서 연결 종료 실패: ${errorMessage}`, errorStack);
        throw error;
      }
    }
  }

  /**
   * Consumer 연결 종료
   */
  private async disconnectConsumer(): Promise<void> {
    if (this.isConsumerConnected) {
      try {
        await this.consumer.disconnect();
        this.isConsumerConnected = false;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        const errorStack = error instanceof Error ? error.stack : undefined;
        this.logger.error(`Kafka 컨슈머 연결 종료 실패: ${errorMessage}`, errorStack);
        throw error;
      }
    }
  }

  /**
   * 단일 메시지 전송 - 기존 API 호환성 유지
   */
  async sendMessage(topic: string, message: unknown): Promise<void> {
    let retries = 0;
    let success = false;

    while (!success && retries < this.maxRetries) {
      try {
        await this.connectProducer();
        await this.producer.send({
          messages: [{ value: JSON.stringify(message) }],
          topic,
        });
        success = true;
        this.logger.debug(`Kafka 메시지 전송 성공: ${topic}`);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        const errorStack = error instanceof Error ? error.stack : undefined;
        retries++;
        this.logger.warn(`Kafka 메시지 전송 재시도 (${retries}/${this.maxRetries}): ${errorMessage}`, errorStack);

        // 연결 문제일 경우 연결 재설정
        this.isProducerConnected = false;

        if (retries >= this.maxRetries) {
          this.logger.error(`Kafka 메시지 전송 최대 재시도 횟수 초과: ${errorMessage}`, errorStack);
          throw error;
        }

        // 재시도 전 지연
        await new Promise((resolve) => {
          setTimeout(resolve, this.retryDelay);
        });
      }
    }
  }

  /**
   * 배치 메시지 전송 (새로운 기능)
   */
  async sendBatchMessages(topic: string, messages: unknown[]): Promise<void> {
    if (!messages.length) {
      return;
    }

    let retries = 0;
    let success = false;

    while (!success && retries < this.maxRetries) {
      try {
        await this.connectProducer();
        await this.producer.send({
          messages: messages.map((message) => ({
            value: JSON.stringify(message),
          })),
          topic,
        });
        success = true;
        this.logger.debug(`Kafka 배치 메시지 전송 성공: ${topic} (${messages.length}개)`);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        const errorStack = error instanceof Error ? error.stack : undefined;
        retries++;
        this.logger.warn(`Kafka 배치 메시지 전송 재시도 (${retries}/${this.maxRetries}): ${errorMessage}`, errorStack);

        // 연결 문제일 경우 연결 재설정
        this.isProducerConnected = false;

        if (retries >= this.maxRetries) {
          this.logger.error(`Kafka 배치 메시지 전송 최대 재시도 횟수 초과: ${errorMessage}`, errorStack);
          throw error;
        }

        // 재시도 전 지연
        await new Promise((resolve) => {
          setTimeout(resolve, this.retryDelay);
        });
      }
    }
  }
}
