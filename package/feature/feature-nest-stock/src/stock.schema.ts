import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { CompanyInfo, StockPhase, StockSchema } from 'shared~type-stock';
import { StockUser } from './user/user.schema';

@Schema()
export class Stock implements StockSchema {
  @Prop()
  stockPhase: StockPhase;

  @Prop({ type: SchemaTypes.Date })
  startedTime: Date;

  @Prop({ type: SchemaTypes.Map })
  companies: Record<string, CompanyInfo[]>;

  @Prop({ type: SchemaTypes.Map })
  remainingStocks: Record<string, number>;

  @Prop()
  isVisibleRank: boolean;

  @Prop()
  isTransaction: boolean;

  @Prop()
  transactionInterval: number;

  @Prop()
  fluctuationsInterval: number;

  @Prop()
  round: number;

  @Prop({ type: [StockUser] })
  users: StockUser[];

  constructor() {
    this.stockPhase = 'CROWDING';
    this.startedTime = new Date();
    this.remainingStocks = {};
    this.companies = {};
    this.isVisibleRank = false;
    this.isTransaction = false;
    this.transactionInterval = 0;
    this.fluctuationsInterval = 5;
    this.round = 0;
    this.users = [];
  }
}

export type StockDocument = HydratedDocument<Stock>;

export const stockSchema = SchemaFactory.createForClass(Stock);
