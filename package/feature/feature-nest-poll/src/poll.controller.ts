import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import type { Request } from 'shared~type-poll';
import { Poll } from './schema/poll.schema';
import { PollService } from './poll.service';

@Controller('poll')
export class PollController {
  constructor(
    private readonly pollService: PollService, // private readonly socketGateway: SocketGateway
  ) {}

  @Get()
  queryPolls(): Promise<Poll[]> {
    return this.pollService.queryPolls();
  }

  @Get('/:pollId')
  queryPoll(@Param('pollId') pollId: string): Promise<Poll> {
    return this.pollService.queryPoll(pollId);
  }

  @Post()
  createPoll(@Body() poll: Poll): Promise<Poll> {
    return this.pollService.createPoll(poll);
  }

  @Patch()
  async updatePoll(@Body() body: Request.PatchPoll): Promise<Poll> {
    const updatedPoll = await this.pollService.updatePoll(body);
    // this.socketGateway.server.emit(`/poll/${body._id}`, updatedPoll);

    return updatedPoll;
  }

  @Delete()
  deletePolls(@Body() body: Request.DeletePolls): Promise<boolean> {
    return this.pollService.deletePolls(body.pollIds);
  }

  // @Delete('vote')
  // deleteVotes(@Body() body: Request.DeleteVotes) {
  //   return this.pollService.deleteVotes(body.pollId, body.voteIds);
  // }

  @Post('vote/add')
  async addVotes(@Body() body: Request.PostAddVotes): Promise<Poll> {
    const updatedPoll = await this.pollService.addVotes(body.pollId, body.votes);
    // this.socketGateway.server.emit(`/poll/${body.pollId}`, updatedPoll);

    return updatedPoll;
  }

  @Post('vote/toggle')
  async toggleVotes(@Body() body: Request.PatchToggleVotes): Promise<Poll> {
    const updatedPoll = await this.pollService.toggleVotes(body);
    // this.socketGateway.server.emit(`/poll/${body.pollId}`, updatedPoll);

    return updatedPoll;
  }
}
