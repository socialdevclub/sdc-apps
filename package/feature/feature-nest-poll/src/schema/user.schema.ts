import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PollUserSchema } from 'shared~type-poll';

@Schema()
export class PollUser implements PollUserSchema {
  @Prop()
  userId: string;

  @Prop()
  nickname?: string;

  @Prop()
  gender?: string;

  @Prop()
  age?: number;

  @Prop()
  mbti?: string;

  @Prop()
  avatarUrl?: string;

  constructor(user: PollUser) {
    this.userId = user.userId;
    this.nickname = user.nickname;
    this.gender = user.gender;
    this.avatarUrl = user.avatarUrl;
    this.age = user.age;
    this.mbti = user.mbti;
  }
}

export type PollUserDocument = HydratedDocument<PollUser>;

export const pollUserSchema = SchemaFactory.createForClass(PollUser);
