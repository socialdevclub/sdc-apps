import { isEqual } from 'lodash';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { PollVoteForm, Request } from 'shared~type-poll';
import { Poll, PollDocument } from './schema/poll.schema';
import { PollVote } from './schema/vote.schema';

@Injectable()
export class PollRepository {
  constructor(
    @InjectModel(Poll.name)
    private readonly pollModel: Model<Poll>,
  ) {}

  findById(
    pollId: string,
    projection?: mongoose.ProjectionType<Poll>,
    options?: mongoose.QueryOptions<Poll>,
  ): Promise<PollDocument> {
    return this.pollModel.findById(pollId, projection, options);
  }

  find(
    filter: mongoose.FilterQuery<Poll>,
    projection?: mongoose.ProjectionType<Poll>,
    options?: mongoose.QueryOptions<Poll>,
  ): Promise<PollDocument[]> {
    return this.pollModel.find(filter, projection, options);
  }

  createPoll(poll: Poll): Promise<PollDocument> {
    return this.pollModel.create(new Poll(poll, poll));
  }

  async updatePoll(poll: Request.PatchPoll): Promise<PollDocument> {
    return this.pollModel.findOneAndUpdate(
      {
        _id: poll._id,
      },
      {
        ...poll,
      },
      {
        returnDocument: 'after',
      },
    );
  }

  addVotes(pollId: string, pollVotes: PollVoteForm[]): Promise<PollDocument> {
    const createdVotes = pollVotes.map((v) => new PollVote(v, v));

    return this.pollModel.findOneAndUpdate(
      { _id: pollId },
      { $addToSet: { votes: { $each: createdVotes } } },
      { returnDocument: 'after' },
    );
  }

  async toggleVotes({ pollId, user, joinVoteTitles, exitVoteTitles }: Request.PatchToggleVotes): Promise<PollDocument> {
    let poll: PollDocument;

    const session = await this.pollModel.startSession();
    await session.withTransaction(async () => {
      poll = await this.findById(pollId, undefined, { session });

      if (!poll) {
        throw new HttpException('poll not found', HttpStatus.NOT_FOUND);
      }

      if (poll.isWhitelist && !poll.whitelistUserIds.some((v) => v === user.userId)) {
        throw new HttpException('user is not whitelist', HttpStatus.FORBIDDEN);
      }

      if (poll.status !== 'OPEN') {
        throw new HttpException('poll is not open', HttpStatus.FORBIDDEN);
      }

      poll.votes.forEach((vote) => {
        const isJoinedVote = (): boolean => vote.userIds.some((v) => v === user.userId);
        if (joinVoteTitles?.some((v) => v === vote.title) && !isJoinedVote()) {
          // TODO: 성별 별로 투표 제한
          if (vote.limitAllCount && vote.limitAllCount <= vote.userIds.length) {
            throw new HttpException('poll is full', HttpStatus.FORBIDDEN);
          }
          vote.userIds.push(user.userId);
        }
        if (exitVoteTitles?.some((v) => v === vote.title) && isJoinedVote()) {
          vote.userIds = vote.userIds.filter((v) => v !== user.userId);
        }
      });

      let isJoinedPoll = false;
      for (const vote of poll.votes) {
        const isJoinedVote = vote.userIds.some((v) => v === user.userId);
        if (isJoinedVote) {
          isJoinedPoll = true;
          break;
        }
      }

      if (isJoinedPoll) {
        const pollUser = poll.users.find((v) => v.userId === user.userId);
        if (!pollUser) {
          poll.users.push(user);
        } else if (!isEqual(pollUser, user)) {
          pollUser.nickname = user.nickname;
          pollUser.gender = user.gender;
          pollUser.avatarUrl = user.avatarUrl;
          pollUser.age = user.age;
          pollUser.mbti = user.mbti;
        }
      } else {
        poll.users = poll.users.filter((v) => v.userId !== user.userId);
      }

      poll.markModified('votes');
      poll.markModified('users');
      await poll.save({ session });
    });
    await session.endSession();

    return poll;
  }

  async deletePolls(pollIds: string[]): Promise<boolean> {
    return !!(await this.pollModel.deleteMany({ _id: { $in: pollIds } }));
  }
}
