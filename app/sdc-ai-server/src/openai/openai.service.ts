import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

interface PromptData {
  question: string;
  answer: string;
}

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;

  private readonly logger = new Logger(OpenAIService.name);

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async processIntroduction(promptData: Array<PromptData>): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        max_tokens: 1500,
        messages: [
          {
            content: '항상 한국어로 응답하세요. 자기소개 글을 작성하는데 도움을 주세요.',
            role: 'system',
          },
          {
            content: this.formatPrompt(promptData),
            role: 'user',
          },
        ],
        model: 'gpt-4o-mini',
        temperature: 0.7,
      });

      return response.choices[0].message.content || '응답을 생성하는 데 문제가 발생했습니다.';
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`OpenAI API 호출 중 오류 발생: ${errorMessage}`, errorStack);
      throw new Error(`OpenAI API 호출 중 오류: ${errorMessage}`);
    }
  }

  private formatPrompt(promptData: Array<PromptData>): string {
    // 프롬프트 데이터로부터 적절한 자기소개 프롬프트를 생성
    return `json 데이터를 기반으로 다음 지시사항에 따라 자기소개 글을 스토리텔링 방식으로 작성해주세요:

1. 직업과 기술 관련 스토리:
   - 현재 기술 분야에 관심을 갖게 된 특별한 계기나 이야기
   - 초기 목표와 현재 추구하는 가치의 변화 과정

2. 의미 있는 경험과 배움:
   - 당신을 성장시킨 특별한 경험이나 도전
   - 경험이 현재 직업이나 관점에 미친 영향

3. 워라밸과 다양한 관심사:
   - 기술 외에 탐구하는 취미나 관심사

4. 구체적인 목표와 비전:
   - 커뮤니티에 기여하고 싶은 부분
   - 특별히 관심 있는 문제나 해결하고 싶은 이슈

5. 개인 철학과 협업 스타일:
   - 팀 협업에서 중요하게 생각하는 가치
   - 소셜데브클럽에서 함께하고 싶은 활동이나 기대

문단 간 자연스러운 전환을 위해 연결 문장을 활용하고, 진솔하고 개인적인 톤을 유지하세요. 기술적 역량과 인간적인 가치를 균형 있게 표현하는 것이 중요합니다.
- 합쇼체 대신 친근한 해요체로 써야 해요. (있습니다 -> 있어요)
- "여러분"과 같이 제 3자에게 말을 걸지 말고, 인사도 하지마
- 최대 1500자로 작성해줘

중요: 제공된 JSON 데이터에 없는 정보는 절대 만들어내지 마세요.

다음은 참고할 JSON 데이터입니다:
${JSON.stringify(promptData)}
`;
  }
}
