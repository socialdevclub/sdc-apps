import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Request } from 'shared~type-party';
import { PartyService } from './party.service';
import { Party } from './schema/party.schema';

@Controller('party')
export class PartyController {
  constructor(private readonly partyService: PartyService) {}

  @Get('/query')
  queryParties(): Promise<Party[]> {
    return this.partyService.queryParties();
  }

  @Get('/query/:partyId')
  queryParty(@Param('partyId') partyId: string): Promise<Party> {
    return this.partyService.queryParty(partyId);
  }

  @Post()
  createParty(@Body() party: Party): Promise<Party> {
    return this.partyService.createParty(party);
  }

  @Post('/join')
  joinParty(@Body() body: Request.PostJoinParty): Promise<Party> {
    return this.partyService.joinParty(body.partyId, body.userId);
  }

  @Post('/leave')
  leaveParty(@Body() body: Request.PostLeaveParty): Promise<Party> {
    return this.partyService.leaveParty(body.partyId, body.userId);
  }

  @Patch()
  updateParty(@Body() body: Request.PatchParty): Promise<boolean> {
    return this.partyService.updateParty(body);
  }

  @Delete()
  deleteParty(@Query('partyId') partyId: string): Promise<boolean> {
    return this.partyService.deleteParty(partyId);
  }
}
