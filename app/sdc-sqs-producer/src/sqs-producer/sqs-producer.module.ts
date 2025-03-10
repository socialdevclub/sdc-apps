import { Module } from '@nestjs/common';

import { SqsProducerService } from './sqs-producer.service';
import { SqsProducerController } from './sqs-producer.controller';

@Module({
  controllers: [SqsProducerController],
  providers: [SqsProducerService],
})
export class SqsProducerModule {}
