import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, EachMessagePayload, Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);

  private kafka: Kafka;

  private producer: Producer;

  private consumer: Consumer;

  private isConsumerRunning = false;

  private readonly consumerCallbacks: Map<string, (payload: EachMessagePayload) => Promise<void>> = new Map();

  constructor() {
    this.kafka = new Kafka({
      brokers: ['localhost:9094'],
      clientId: 'stock_service',
    });
    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
    });

    this.consumer = this.kafka.consumer({
      groupId: 'stock_service_group',
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.producer.connect();
      await this.consumer.connect();
      this.logger.log('Connected to Kafka');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      this.logger.error(`Failed to connect to Kafka: ${errorMessage}`);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      this.isConsumerRunning = false;
      this.logger.log('Disconnected from Kafka');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      this.logger.error(`Error during Kafka disconnect: ${errorMessage}`);
    }
  }

  async subscribeToTopic(topic: string, callback: (payload: EachMessagePayload) => Promise<void>): Promise<void> {
    this.consumerCallbacks.set(topic, callback);

    try {
      await this.consumer.subscribe({ topic });
      this.logger.log(`Subscribed to topic: ${topic}`);

      if (!this.isConsumerRunning) {
        this.isConsumerRunning = true;
        await this.consumer.run({
          eachMessage: async (payload: EachMessagePayload) => {
            const callback = this.consumerCallbacks.get(payload.topic);
            if (callback) {
              try {
                await callback(payload);
              } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
                this.logger.error(`Error processing message from topic ${payload.topic}: ${errorMessage}`);
              }
            }
          },
        });
        this.logger.log('Kafka consumer started');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      this.logger.error(`Failed to subscribe to topic ${topic}: ${errorMessage}`);
      throw error;
    }
  }

  async sendMessage(topic: string, message: unknown): Promise<void> {
    try {
      const messageValue = typeof message === 'string' ? message : JSON.stringify(message);

      await this.producer.send({
        messages: [{ value: messageValue }],
        topic,
      });

      this.logger.debug(`Message sent to topic ${topic}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      this.logger.error(`Failed to send message to topic ${topic}: ${errorMessage}`);
      throw error;
    }
  }
}
