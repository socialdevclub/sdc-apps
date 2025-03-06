import { Injectable, Inject } from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  Message,
} from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { SqsMessage, SqsOptions } from './sqs.types';

@Injectable()
export class SqsService {
  private sqsClient: SQSClient;

  private queueUrl: string;

  constructor(private configService: ConfigService, @Inject('SQS_OPTIONS') private options: SqsOptions) {
    this.sqsClient = new SQSClient({
      credentials: {
        accessKeyId: this.options.accessKeyId || this.configService.get<string>('AWS_ACCESS_KEY_ID', ''),
        secretAccessKey: this.options.secretAccessKey || this.configService.get<string>('AWS_SECRET_ACCESS_KEY', ''),
      },
      region: this.options.region || this.configService.get<string>('AWS_REGION', 'ap-northeast-2'),
    });
    this.queueUrl = this.options.queueUrl || this.configService.get<string>('AWS_SQS_QUEUE_URL', '');
  }

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
    const command = new ReceiveMessageCommand({
      MaxNumberOfMessages: maxMessages,
      QueueUrl: this.queueUrl,
      WaitTimeSeconds: 20, // 롱 폴링 설정
    });

    const response = await this.sqsClient.send(command);
    return response.Messages || [];
  }

  async deleteMessage(receiptHandle: string): Promise<void> {
    const command = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    });

    await this.sqsClient.send(command);
  }
}
