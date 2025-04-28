import { Body, Controller, Post } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { IntroductionRequestDto } from './dto/introduction-request.dto';

@Controller('ai')
export class OpenAIController {
  constructor(private readonly openaiService: OpenAIService) {}

  @Post('introduction')
  async generateIntroduction(@Body() requestDto: IntroductionRequestDto): Promise<{ content: string }> {
    const responseContent = await this.openaiService.processIntroduction(requestDto.data);
    return { content: responseContent };
  }
}
