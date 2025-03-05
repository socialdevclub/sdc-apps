import { StockUserForm, StockUserRequired, StockUserSchema, StockUserInfoSchema } from 'shared~type-stock';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';

@Schema({ _id: false })
export class StockUserInfo implements StockUserInfoSchema {
  @Prop()
  gender: string;

  @Prop()
  nickname: string;

  @Prop()
  introduction: string;
}

@Schema()
export class StockUser implements StockUserSchema {
  @Prop()
  stockId: string;

  @Prop()
  userId: string;

  @Prop({ type: StockUserInfo })
  userInfo: StockUserInfo;

  @Prop()
  index: number;

  @Prop()
  money: number;

  @Prop({ type: SchemaTypes.Map })
  inventory: Record<string, number>;

  @Prop({ type: SchemaTypes.Date })
  lastActivityTime: Date;

  @Prop({ default: 0 })
  loanCount: number;

  constructor(required: Pick<StockUserSchema, StockUserRequired>, partial: StockUserForm) {
    this.userId = required.userId;
    this.stockId = required.stockId;

    this.money = partial.money ?? 1000000;
    this.inventory = partial.inventory ?? {};
    this.lastActivityTime = new Date();
    this.loanCount = partial.loanCount ?? 0;
  }
}

export type UserDocument = HydratedDocument<StockUser>;

export const userSchema = SchemaFactory.createForClass(StockUser);
