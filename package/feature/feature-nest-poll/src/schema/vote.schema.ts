import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PollVoteOmited, PollVoteRequired, PollVoteSchema } from 'shared~type-poll';

@Schema()
export class PollVote implements PollVoteSchema {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  userIds: string[];

  @Prop()
  limitAllCount?: number;

  @Prop()
  limitMaleCount?: number;

  @Prop()
  limitFemaleCount?: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  deletedAt?: Date;

  constructor(
    required: Pick<PollVote, PollVoteRequired>,
    partial: Partial<Omit<PollVote, PollVoteRequired | PollVoteOmited>>,
  ) {
    this.title = required.title;

    this.userIds = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();

    this.description = partial.description ?? '';
    this.limitAllCount = partial.limitAllCount;
    this.limitMaleCount = partial.limitMaleCount;
    this.limitFemaleCount = partial.limitFemaleCount;
  }
}

export type PollVoteDocument = HydratedDocument<PollVote>;

export const pollVoteSchema = SchemaFactory.createForClass(PollVote);
