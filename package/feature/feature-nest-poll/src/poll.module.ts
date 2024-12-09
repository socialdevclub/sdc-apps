import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PollService } from './poll.service';
import { PollController } from './poll.controller';
import { PollRepository } from './poll.repository';
import { Poll, pollSchema } from './schema/poll.schema';

@Module({
  controllers: [PollController],
  imports: [MongooseModule.forFeature([{ name: Poll.name, schema: pollSchema }])],
  providers: [PollService, PollRepository],
})
export class PollModule {}
