import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Outbox, OutboxSchema } from './outbox.schema';
import { OutboxRepository } from './outbox.repository';
import { OutboxProcessor } from './outbox.processor';
import { KafkaModule } from '../kafka/kafka.module';
import { OutboxService } from './outbox.service';

@Module({
  exports: [OutboxRepository, OutboxService],
  imports: [MongooseModule.forFeature([{ name: Outbox.name, schema: OutboxSchema }]), KafkaModule],
  providers: [OutboxRepository, OutboxProcessor, OutboxService],
})
export class OutboxModule {}
