import { Module } from '@nestjs/common';
import { UserModule } from 'feature-nest-stock';
import { SqsProducerService } from './sqs-producer.service';

@Module({
  imports: [UserModule],
  providers: [SqsProducerService],
})
export class SqsProducerModule {}
