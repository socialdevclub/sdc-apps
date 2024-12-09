import { Injectable } from '@nestjs/common';
import { PollVoteForm, Request } from 'shared~type-poll';
import { PollRepository } from './poll.repository';
import { Poll, PollDocument } from './schema/poll.schema';

@Injectable()
export class PollService {
  constructor(private readonly pollRepository: PollRepository) {}

  queryPoll(pollId: string): Promise<PollDocument> {
    return this.pollRepository.findById(pollId);
  }

  queryPolls(): Promise<PollDocument[]> {
    return this.pollRepository.find(undefined);
  }

  createPoll(poll: Poll): Promise<PollDocument> {
    console.debug('🚀 ~ file: poll.service.ts:14 ~ PollService ~ createPoll ~ poll:', poll);
    return this.pollRepository.createPoll(poll);
  }

  updatePoll(poll: Request.PatchPoll): Promise<Poll> {
    return this.pollRepository.updatePoll(poll);
  }

  deletePolls(pollIds: string[]): Promise<boolean> {
    return this.pollRepository.deletePolls(pollIds);
  }

  // deleteVotes(pollId: string, voteIds: string[]): Promise<boolean> {
  //   return this.pollRepository.deleteVotes(pollId, voteIds);
  // }

  addVotes(pollId: string, pollVotes: PollVoteForm[]): Promise<Poll> {
    return this.pollRepository.addVotes(pollId, pollVotes);
  }

  async toggleVotes(body: Request.PatchToggleVotes): Promise<Poll> {
    return this.pollRepository.toggleVotes(body);
  }
}
