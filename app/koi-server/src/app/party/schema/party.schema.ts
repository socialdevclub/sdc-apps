import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { PartyOmited, PartyRequired, PartySchema } from 'shared~type-party';

@Schema()
export class Party implements PartySchema {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  activityId: string;

  @Prop()
  activityName: string;

  @Prop()
  authorId?: string;

  @Prop()
  status: string;

  @Prop()
  pendingUserIds: string[];

  @Prop()
  joinedUserIds: string[];

  @Prop()
  likedUserIds: string[];

  @Prop()
  limitAllCount: number;

  @Prop()
  limitMaleCount: number;

  @Prop()
  limitFemaleCount: number;

  @Prop()
  publicScope: 'DRAFT' | 'PUBLIC' | 'PRIVATE' | 'CLOSED';

  @Prop()
  privatePassword?: string;

  @Prop()
  price: number;

  @Prop({ type: SchemaTypes.Date })
  createdAt: Date;

  @Prop({ type: SchemaTypes.Date })
  updatedAt: Date;

  @Prop({ type: SchemaTypes.Date })
  deletedAt?: Date;

  constructor(required: Pick<Party, PartyRequired>, partial: Partial<Omit<Party, PartyRequired | PartyOmited>>) {
    this.title = required.title;
    this.limitAllCount = required.limitAllCount;

    this.description = partial.description ?? '';
    this.authorId = partial.authorId;
    this.price = partial.price ?? 0;
    this.limitMaleCount = partial.limitMaleCount ?? required.limitAllCount;
    this.limitFemaleCount = partial.limitFemaleCount ?? required.limitAllCount;
    this.activityId = partial.activityId ?? 'INITIAL';
    this.activityName = partial.activityName ?? 'INITIAL';

    this.publicScope = 'DRAFT';
    this.joinedUserIds = [];
    this.likedUserIds = [];
    this.pendingUserIds = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

export type PartyDocument = HydratedDocument<Party>;

export const partySchema = SchemaFactory.createForClass(Party);
