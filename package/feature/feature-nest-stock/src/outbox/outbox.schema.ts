import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OutboxDocument = Outbox & Document;

export enum OutboxStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
}

export enum OutboxEventType {
  STOCK_PURCHASED = 'STOCK_PURCHASED',
  STOCK_SOLD = 'STOCK_SOLD',
  STOCK_INFO_DRAWN = 'STOCK_INFO_DRAWN',
}

@Schema({ timestamps: true })
export class Outbox {
  @Prop({ required: true })
  eventType: OutboxEventType;

  @Prop({ required: true })
  payload: string;

  @Prop({ default: OutboxStatus.PENDING, required: true })
  status: OutboxStatus;

  @Prop({ required: true })
  topic: string;

  @Prop()
  errorMessage?: string;

  @Prop({ default: 0 })
  retryCount: number;

  @Prop()
  processedAt?: Date;
}

export const OutboxSchema = SchemaFactory.createForClass(Outbox);
