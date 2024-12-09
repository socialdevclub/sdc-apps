import type { GameSchema } from '.';

export type UpdateGame = Partial<Omit<GameSchema, 'unique'>>;

export type QuizAnswerTime = {
  answer: string;
  quizId: string;
};

export type QuizAnswerStop = {
  quizId: string;
};

export type QuizSubmit = {
  quizId: string;
  answer: string;
  nickname: string;
  phaseIdx: number;
};
