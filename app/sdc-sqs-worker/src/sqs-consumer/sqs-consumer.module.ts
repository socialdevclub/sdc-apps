import { Module } from '@nestjs/common';
import { StockModule, UserModule } from 'feature-nest-stock';
import { SqsConsumerService } from './sqs-consumer.service';

@Module({
  imports: [UserModule, StockModule],
  providers: [SqsConsumerService],
})
export class SqsConsumerModule {}
