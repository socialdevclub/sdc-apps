import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SqsModule } from 'lib-nest-sqs';
import { SqsConsumerModule } from './sqs-consumer/sqs-consumer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    SqsModule.forRoot({
      isGlobal: true,
      options: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        queueUrl: process.env.AWS_SQS_QUEUE_URL,
        region: process.env.AWS_REGION || 'ap-northeast-2',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    }),
    SqsConsumerModule,
  ],
})
export class AppModule {}
