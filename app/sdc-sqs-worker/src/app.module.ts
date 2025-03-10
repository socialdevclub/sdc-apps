import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SqsModule } from 'lib-nest-sqs';
import { MongooseModule } from '@nestjs/mongoose';
import { SqsConsumerModule } from './sqs-consumer/sqs-consumer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI!, {
      ignoreUndefined: true,
      maxIdleTimeMS: 60000,
    }),
    SqsModule.forRoot({
      isGlobal: true,
      options: {
        queueUrl: process.env.AWS_SQS_QUEUE_URL,
        region: 'ap-northeast-2',
      },
    }),
    SqsConsumerModule,
  ],
})
export class AppModule {}
