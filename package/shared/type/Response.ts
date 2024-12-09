import { GameSchema } from '.';

export type UploadAvatar = {
  // Express 타입을 왜 못찾을까?
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  file: Express.Multer.File;
};

export type Game = GameSchema;
