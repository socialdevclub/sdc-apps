import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import type { Context, Handler, Callback } from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';
import { AppModule } from './app.module';

let server: Handler;
let app: INestApplication;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function bootstrap() {
  // NestJS 애플리케이션 생성
  app = await NestFactory.create(AppModule);
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event: unknown, context: Context, callback: Callback) => {
  try {
    // 서버 초기화 (서버가 아직 초기화되지 않은 경우)
    server = server ?? (await bootstrap());
    return server(event, context, callback);
  } catch (error) {
    console.error('Lambda 핸들러 오류:', error);
    return {
      body: JSON.stringify({ message: '내부 서버 오류가 발생했습니다.' }),
      statusCode: 500,
    };
  }
};
