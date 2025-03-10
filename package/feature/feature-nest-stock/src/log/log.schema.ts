import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { StockLogAction, StockLogSchema } from 'shared~type-stock';

@Schema()
export class StockLog implements StockLogSchema {
  @Prop()
  stockId: string;

  @Prop()
  userId: string;

  @Prop()
  date: Date;

  @Prop()
  round: number;

  @Prop({ type: SchemaTypes.String })
  action: StockLogAction;

  @Prop()
  company: string;

  @Prop()
  price: number;

  @Prop()
  quantity: number;

  constructor(stockLog: StockLog) {
    Object.assign(this, stockLog);
  }
}

export type StockLogDocument = HydratedDocument<StockLog>;

export const stockLogSchema = SchemaFactory.createForClass(StockLog);
