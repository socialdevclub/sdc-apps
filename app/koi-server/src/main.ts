import 'dayjs/locale/ko';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@codegenie/serverless-express';
import type { Callback, Context, Handler } from 'aws-lambda';
import { type INestApplication } from '@nestjs/common';
import { AppModule } from './app/app.module';

dayjs.extend(utc);

let server: Handler;

export function commonConfig(app: INestApplication): void {}

async function bootstrap(): Promise<Handler> {
  const app = await NestFactory.create(AppModule);
  commonConfig(app);
  app.enableCors({
    credentials: true,
    origin: /^([\w:/]+)?([\w]+\.)?(palete\.me)(:\d{1,5})?$/,
  });
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event: unknown, context: Context, callback: Callback) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
