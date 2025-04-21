import { StockUserForm, StockUserRequired, StockUserSchema, StockUserInfoSchema } from 'shared~type-stock';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { StockConfig } from 'shared~config';

@Schema({ _id: false })
export class StockUserInfo implements StockUserInfoSchema {
  @Prop()
  gender: string;

  @Prop()
  nickname: string;

  @Prop()
  introduction?: string;
}

@Schema({ autoIndex: true })
export class StockUser implements StockUserSchema {
  @Prop()
  stockId: string;

  @Prop()
  userId: string;

  @Prop({ type: StockUserInfo })
  userInfo: StockUserInfoSchema;

  @Prop()
  index: number;

  @Prop()
  money: number;

  @Prop({ type: SchemaTypes.Date })
  lastActivityTime: Date;

  @Prop({ default: 0 })
  loanCount: number;

  @Prop({ type: SchemaTypes.Mixed })
  companyStorage: StockUserSchema['companyStorage'];

  constructor(required: Pick<StockUserSchema, StockUserRequired>, partial: StockUserForm) {
    this.userId = required.userId;
    this.stockId = required.stockId;
    this.userInfo = required.userInfo;

    this.index = partial.index ?? 0;
    this.money = partial.money ?? StockConfig.INIT_USER_MONEY;
    this.lastActivityTime = new Date();
    this.loanCount = partial.loanCount ?? 0;
    this.companyStorage = partial.companyStorage ?? {};
  }
}

export type UserDocument = HydratedDocument<StockUser>;

export const userSchema = SchemaFactory.createForClass(StockUser);

// eslint-disable-next-line sort-keys-fix/sort-keys-fix
userSchema.index({ stockId: 1, index: 1 });
