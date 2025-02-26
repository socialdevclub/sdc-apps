import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';

@Module({
  exports: [KafkaService],
  providers: [KafkaService],
})
export class KafkaModule {}
