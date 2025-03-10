import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SqsModule } from 'lib-nest-sqs';
import { SqsProducerModule } from './sqs-producer/sqs-producer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    SqsModule.forRoot({
      isGlobal: true,
      options: {
        queueUrl: process.env.AWS_SQS_QUEUE_URL,
        region: 'ap-northeast-2',
      },
    }),
    SqsProducerModule,
  ],
})
export class AppModule {}
