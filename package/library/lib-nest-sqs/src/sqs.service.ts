import { Injectable, Inject } from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  Message,
} from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { SqsMessage, SqsOptions } from './sqs.types';

// SQS 이벤트 스키마 정의
const SqsRecordSchema = z.object({
  body: z.string(),
  eventSource: z.literal('aws:sqs'),
});

export const SqsEventSchema = z.object({
  Records: z.array(SqsRecordSchema).min(1),
});

// 타입 추론을 위한 인터페이스 정의
export type SqsEvent = z.infer<typeof SqsEventSchema>;

@Injectable()
export class SqsService {
  private sqsClient: SQSClient;

  private queueUrl: string;

  constructor(private configService: ConfigService, @Inject('SQS_OPTIONS') private options: SqsOptions) {
    this.sqsClient = new SQSClient({
      region: this.options.region || this.configService.get<string>('AWS_REGION', 'ap-northeast-2'),
    });
    this.queueUrl = this.options.queueUrl || this.configService.get<string>('AWS_SQS_QUEUE_URL', '');
  }

  /**
   * 메시지를 보내는 함수
   * @param action 메시지 액션
   * @param data 메시지 데이터
   * @returns 메시지 ID
   */
  async sendMessage<T>(action: string, data: T): Promise<string> {
    const message: SqsMessage<T> = {
      action,
      data,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    const command = new SendMessageCommand({
      MessageBody: JSON.stringify(message),
      QueueUrl: this.queueUrl,
    });

    const response = await this.sqsClient.send(command);
    return response.MessageId || '';
  }

  async receiveMessages(maxMessages = 1): Promise<Message[]> {
    try {
      const command = new ReceiveMessageCommand({
        AttributeNames: ['All'],
        MaxNumberOfMessages: maxMessages,
        MessageAttributeNames: ['All'],
        QueueUrl: this.queueUrl,
      });

      console.log(this.queueUrl);

      const response = await this.sqsClient.send(command);
      console.log(response);

      return response.Messages || [];
    } catch (error) {
      console.error('SQS 메시지 수신 오류:', error);
      throw error;
    }
  }

  async deleteMessage(receiptHandle: string): Promise<void> {
    const command = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    });

    await this.sqsClient.send(command);
  }

  /**
   * Lambda 트리거로 전달된 SQS 메시지 처리 함수
   * @param event Lambda 이벤트 객체
   * @param handler 각 메시지를 처리할 핸들러 함수
   * @param options 처리 옵션 (concurrent: 동시 처리 여부 => mongoDB 트랜잭션 사용 시, 동시 처리 불가능하므로 false로 설정)
   * @returns 처리된 메시지 배열
   */
  async processSqsEvent<T>(
    event: SqsEvent,
    handler: (message: SqsMessage<T>) => Promise<void>,
    options?: { concurrent: boolean },
  ): Promise<SqsMessage<T>[]> {
    const processedMessages: SqsMessage<T>[] = [];

    // 동시 처리 모드 (병렬 처리)
    if (options?.concurrent) {
      const promises = event.Records.map(async (record) => {
        try {
          const messageBody = JSON.parse(record.body) as SqsMessage<T>;
          await handler(messageBody);
          return messageBody;
        } catch (error) {
          console.error('메시지 처리 중 오류 발생:', error);
          throw error;
        }
      });

      const results = await Promise.all(promises);
      processedMessages.push(...results);
    }
    // FIFO 모드 (순차 처리)
    else {
      for (const record of event.Records) {
        try {
          const messageBody = JSON.parse(record.body) as SqsMessage<T>;
          await handler(messageBody);
          processedMessages.push(messageBody);
        } catch (error) {
          console.error('메시지 처리 중 오류 발생:', error);
          throw error; // 오류를 다시 던져서 Lambda가 실패를 인식하도록 함
        }
      }
    }

    return processedMessages;
  }
}
