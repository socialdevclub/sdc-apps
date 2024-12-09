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

  @Prop({ type: SchemaTypes.String })
  action: StockLogAction;

  @Prop()
  company: string;

  @Prop()
  price: number;

  @Prop()
  quantity: number;

  constructor(partial: Partial<StockLog>) {
    Object.assign(this, partial);
  }
}

export type StockLogDocument = HydratedDocument<StockLog>;

export const stockLogSchema = SchemaFactory.createForClass(StockLog);
