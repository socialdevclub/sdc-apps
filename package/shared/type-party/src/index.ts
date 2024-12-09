export type * as Request from './Request';
export type * as Response from './Response';

export type PublicScope = 'DRAFT' | 'PUBLIC' | 'PRIVATE' | 'CLOSED';

export type PartyRequired = 'title' | 'limitAllCount';
export type PartyOmited = 'createdAt' | 'updatedAt' | 'deletedAt';
export type PartyForm = Pick<PartySchema, PartyRequired> & Partial<Omit<PartySchema, PartyRequired | PartyOmited>>;
export type PartySchema = {
  title: string;
  description: string;
  activityId: string;
  activityName?: string;
  authorId?: string;
  pendingUserIds: string[];
  joinedUserIds: string[];
  likedUserIds: string[];
  limitAllCount: number;
  limitMaleCount: number;
  limitFemaleCount: number;
  publicScope: PublicScope;
  privatePassword?: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};
export type PartySchemaWithId = PartySchema & { _id: string };
