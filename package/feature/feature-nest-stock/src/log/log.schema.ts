import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { SchemaTypes } from 'mongoose';
import type { StockLogAction, StockLogSchema } from 'shared~type-stock';

@Schema({ autoIndex: true })
export class StockLog implements StockLogSchema {
  @Prop()
  stockId: string;

  @Prop()
  userId: string;

  @Prop()
  date: Date;

  @Prop()
  round: number;

  @Prop()
  status: 'QUEUING' | 'SUCCESS' | 'FAILED' | 'CANCEL';

  @Prop()
  queueId?: string;

  @Prop({ type: SchemaTypes.String })
  action: StockLogAction;

  @Prop()
  company: string;

  @Prop()
  price: number;

  @Prop()
  quantity: number;

  @Prop()
  failedReason?: string;

  constructor(stockLog: StockLog) {
    Object.assign(this, stockLog);
  }
}

export type StockLogDocument = HydratedDocument<StockLog>;

export const stockLogSchema = SchemaFactory.createForClass(StockLog);
stockLogSchema.index({ round: 1, stockId: 1, userId: 1 });
