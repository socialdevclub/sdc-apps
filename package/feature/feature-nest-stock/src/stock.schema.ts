import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { CompanyInfo, StockPhase, StockSchema } from 'shared~type-stock';

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

  constructor() {
    this.stockPhase = 'CROWDING';
    this.startedTime = new Date();
    this.remainingStocks = {};
    this.companies = {};
    this.isVisibleRank = false;
    this.isTransaction = false;
    this.transactionInterval = 5;
    this.fluctuationsInterval = 5;
    this.round = 0;
  }
}

export type StockDocument = HydratedDocument<Stock>;

export const stockSchema = SchemaFactory.createForClass(Stock);
