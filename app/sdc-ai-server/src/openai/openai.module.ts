import { Module } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { OpenAIController } from './openai.controller';

@Module({
  controllers: [OpenAIController],
  exports: [OpenAIService],
  providers: [OpenAIService],
})
export class OpenAIModule {}
