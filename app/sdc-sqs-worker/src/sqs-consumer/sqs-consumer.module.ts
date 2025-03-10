import { Module } from '@nestjs/common';
import { UserModule } from 'feature-nest-stock';
import { SqsConsumerService } from './sqs-consumer.service';

@Module({
  imports: [UserModule],
  providers: [SqsConsumerService],
})
export class SqsConsumerModule {}
