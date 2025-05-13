import dayjs from 'dayjs';
import { PartyOmited, PartyRequired, PartySchema } from 'shared~type-party';

// DynamoDB용 Party 클래스
export class Party implements PartySchema {
  _id: string; // 파티션 키로 사용

  title: string;

  description: string;

  activityId: string;

  activityName: string;

  authorId?: string;

  status: string;

  pendingUserIds: string[];

  joinedUserIds: string[];

  likedUserIds: string[];

  limitAllCount: number;

  limitMaleCount: number;

  limitFemaleCount: number;

  publicScope: 'DRAFT' | 'PUBLIC' | 'PRIVATE' | 'CLOSED';

  privatePassword?: string;

  price: number;

  createdAt: string;

  updatedAt: string;

  deletedAt?: string;

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
    this.createdAt = dayjs().toISOString();
    this.updatedAt = dayjs().toISOString();
  }
}
