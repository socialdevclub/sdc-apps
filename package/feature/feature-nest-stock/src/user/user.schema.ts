import {
  StockUserForm,
  StockUserRequired,
  StockUserSchema,
  StockUserInfoSchema,
  StockStorageSchema,
} from 'shared~type-stock';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { StockConfig } from 'shared~config';

@Schema()
export class StockUserStorage implements StockStorageSchema {
  @Prop()
  companyName: string;

  @Prop()
  stockCountCurrent: number;

  @Prop()
  stockCountHistory: number[];
}

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

  @Prop({ type: [StockUserStorage] })
  stockStorages: StockStorageSchema[];

  constructor(required: Pick<StockUserSchema, StockUserRequired>, partial: StockUserForm) {
    this.userId = required.userId;
    this.userInfo = required.userInfo;

    this.index = partial.index ?? 0;
    this.money = partial.money ?? StockConfig.INIT_USER_MONEY;
    this.lastActivityTime = new Date();
    this.loanCount = partial.loanCount ?? 0;

    const companies = StockConfig.getRandomCompanyNames();
    const stockStorages = companies.map((company) => {
      return {
        companyName: company,
        stockCountCurrent: 0,
        stockCountHistory: new Array(StockConfig.MAX_STOCK_IDX + 1).fill(0),
      } as StockStorageSchema;
    });

    this.stockStorages = partial.stockStorages ?? stockStorages;
  }
}

export type UserDocument = HydratedDocument<StockUser>;

export const userSchema = SchemaFactory.createForClass(StockUser);

// 인덱스 수정 - stockId 제거됨
userSchema.index({ index: 1 });
