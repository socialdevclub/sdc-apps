import { Injectable } from '@nestjs/common';
import { EachMessagePayload, Kafka } from 'kafkajs';

@Injectable()
export class KafkaService {
  private kafka = new Kafka({
    brokers: ['localhost:9094'],
    clientId: 'koi_kafka',
  });

  private producer = this.kafka.producer();

  private consumer = this.kafka.consumer({ groupId: 'stock_service_group' });

  constructor() {
    this.consumer.connect(); // 접속
    this.consumer.subscribe({ topics: ['stock.transaction.topic'] }); // 구독
    this.consumer.run({
      eachMessage: this.consumerCallback, // 메세지 수신 콜백
    });
  }

  async consumerCallback(payload: EachMessagePayload): Promise<void> {
    // 메세지 수신 콜백
    console.log('kafka message arrived');
    console.log(`topic: ${payload.topic}, Message:${payload.message.value.toString()}`);
  }

  async addSubscriptionTopic(topic: string): Promise<void> {
    await this.consumer.stop(); // 컨슈머 멈추고
    await this.consumer.subscribe({ topic }); // 구독하고
    await this.consumer.run({
      eachMessage: this.consumerCallback,
    });
  }

  async sendMessage(topic: string, message: unknown): Promise<void> {
    await this.producer.connect();
    await this.producer.send({
      messages: [{ value: JSON.stringify(message) }],
      topic,
    });
    await this.producer.disconnect();
  }
}
