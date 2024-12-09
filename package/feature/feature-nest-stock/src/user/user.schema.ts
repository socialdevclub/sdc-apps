import { StockUserForm, StockUserRequired, StockUserSchema } from 'shared~type-stock';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

@Schema()
export class StockUser implements StockUserSchema {
  @Prop()
  stockId: string;

  @Prop()
  userId: string;

  @Prop()
  money: number;

  @Prop({ type: SchemaTypes.Map })
  inventory: Record<string, number>;

  @Prop({ type: SchemaTypes.Date })
  lastActivityTime: Date;

  constructor(required: Pick<StockUserSchema, StockUserRequired>, partial: StockUserForm) {
    this.userId = required.userId;
    this.stockId = required.stockId;

    this.money = partial.money ?? 1000000;
    this.inventory = partial.inventory ?? {};
    this.lastActivityTime = new Date();
  }
}

export type UserDocument = HydratedDocument<StockUser>;

export const userSchema = SchemaFactory.createForClass(StockUser);
