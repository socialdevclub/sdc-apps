import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';

@Injectable()
export class LockService implements OnModuleInit {
  private producer: Producer;

  private consumer: Consumer;

  private kafka: Kafka;

  private readonly LOCK_TOPIC = 'distributed-lock';

  private activeLocks: Map<string, boolean> = new Map();

  constructor() {
    this.kafka = new Kafka({
      brokers: ['localhost:9092'],
      clientId: 'lock-service',
    });
  }

  async onModuleInit(): Promise<void> {
    await this.initializeProducer();
    await this.initializeConsumer();
  }

  private async initializeProducer(): Promise<void> {
    this.producer = this.kafka.producer();
    await this.producer.connect();
  }

  private async initializeConsumer(): Promise<void> {
    this.consumer = this.kafka.consumer({ groupId: 'lock-group' });
    await this.consumer.connect();
    await this.consumer.subscribe({ fromBeginning: true, topic: this.LOCK_TOPIC });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const lockData = JSON.parse(message.value.toString());
        if (lockData.action === 'acquire') {
          this.activeLocks.set(lockData.resourceId, true);
        } else if (lockData.action === 'release') {
          this.activeLocks.delete(lockData.resourceId);
        }
      },
    });
  }

  async acquireLock(resourceId: string, timeout = 5000): Promise<boolean> {
    if (this.activeLocks.has(resourceId)) {
      return false;
    }

    const lockMessage = {
      action: 'acquire',
      nodeId: process.env.NODE_ID || 'default-node',
      resourceId,
      timestamp: Date.now(),
    };

    try {
      await this.producer.send({
        messages: [
          {
            key: resourceId,
            value: JSON.stringify(lockMessage),
          },
        ],
        topic: this.LOCK_TOPIC,
      });

      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.activeLocks.get(resourceId)) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 100);

        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(false);
        }, timeout);
      });
    } catch (error) {
      console.error('Failed to acquire lock:', error);
      return false;
    }
  }

  async releaseLock(resourceId: string): Promise<boolean> {
    if (!this.activeLocks.has(resourceId)) {
      return false;
    }

    const releaseMessage = {
      action: 'release',
      nodeId: process.env.NODE_ID || 'default-node',
      resourceId,
      timestamp: Date.now(),
    };

    try {
      await this.producer.send({
        messages: [
          {
            key: resourceId,
            value: JSON.stringify(releaseMessage),
          },
        ],
        topic: this.LOCK_TOPIC,
      });

      return true;
    } catch (error) {
      console.error('Failed to release lock:', error);
      return false;
    }
  }
}
