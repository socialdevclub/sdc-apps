export type * as Request from './Request';
export type * as Response from './Response';

export type PollUserSchema = {
  userId: string;
  nickname?: string;
  gender?: string;
  age?: number;
  mbti?: string;
  avatarUrl?: string;
};

export type PollVoteRequired = 'title';
export type PollVoteOmited = 'userIds' | 'createdAt' | 'updatedAt' | 'deletedAt';
export type PollVoteForm = Pick<PollVoteSchema, PollVoteRequired> &
  Partial<Omit<PollVoteSchema, PollVoteRequired | PollVoteOmited>>;
export type PollVoteSchema = {
  title: string;
  description: string;
  userIds: string[];
  limitAllCount?: number;
  limitMaleCount?: number;
  limitFemaleCount?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

const PollStatus = ['DRAFT', 'OPEN', 'CLOSE'] as const;
export type PollStatus = (typeof PollStatus)[number];
export type PollRequired = 'title';
export type PollOmited = 'createdAt' | 'updatedAt' | 'deletedAt' | 'votes' | 'users';
export type PollForm = Pick<PollSchema, PollRequired> & Partial<Omit<PollSchema, PollRequired | PollOmited>>;
export type PollSchema = {
  title: string;
  description: string;
  authorId?: string;
  votes: PollVoteSchema[];
  status: PollStatus;
  limitAllCount?: number;
  limitMaleCount?: number;
  limitFemaleCount?: number;
  isMultipleVote: boolean;
  isAnonymous: boolean;
  isAllowAddVote: boolean;
  isWhitelist: boolean;
  whitelistUserIds: string[];
  users: PollUserSchema[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};
export type PollSchemaWithId = PollSchema & { _id: string };
