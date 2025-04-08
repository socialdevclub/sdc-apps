import { IsArray } from 'class-validator';

export class IntroductionRequestDto {
  @IsArray()
  data!: Array<{
    question: string;
    answer: string;
  }>;
}
