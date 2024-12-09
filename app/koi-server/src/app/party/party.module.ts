import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PartyController } from './party.controller';
import { PartyService } from './party.service';
import { Party, partySchema } from './schema/party.schema';
import { PartyRepository } from './party.repository';

@Module({
  controllers: [PartyController],
  imports: [MongooseModule.forFeature([{ name: Party.name, schema: partySchema }])],
  providers: [PartyService, PartyRepository],
})
export class PartyModule {}
