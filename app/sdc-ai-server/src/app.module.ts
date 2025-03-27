import { Module } from '@nestjs/common';
import { OpenAIModule } from './openai/openai.module';

@Module({
  imports: [OpenAIModule],
})
export class AppModule {}
