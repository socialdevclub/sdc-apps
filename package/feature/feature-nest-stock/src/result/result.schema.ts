import { ResultSchema } from 'shared~type-stock';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Result implements ResultSchema {
  @Prop()
  stockId: string;

  @Prop()
  userId: string;

  @Prop()
  round: number;

  @Prop()
  money: number;

  constructor({ userId: nickname, round, money }: ResultSchema) {
    this.userId = nickname;
    this.money = money;
    this.round = round;
  }
}

export type ResultDocument = HydratedDocument<Result>;

export const resultSchema = SchemaFactory.createForClass(Result);
