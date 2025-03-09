import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import type { Context, Handler, Callback } from 'aws-lambda';
import serverlessExpress from '@codegenie/serverless-express';
import { SqsEventSchema, SqsService } from 'lib-nest-sqs';
import { AppModule } from './app.module';
import { SqsConsumerService } from './sqs-consumer/sqs-consumer.service';

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

    // SQS 이벤트 처리
    try {
      // SqsService 인스턴스를 가져옵니다 - 프로바이더 토큰으로 가져옵니다
      const sqsService = app.get(SqsService);
      const sqsConsumerService = app.get(SqsConsumerService);

      const { success: isSqsEvent, data: sqsEvent } = SqsEventSchema.safeParse(event);
      if (isSqsEvent) {
        // SQS 메시지를 처리합니다
        const processedMessages = await sqsService.processSqsEvent(sqsEvent, async (message) => {
          console.log(`처리 중인 메시지 액션: ${message.action}`);
          // 여기서 메시지의 action에 따라 다른 서비스나 핸들러로 라우팅할 수 있습니다
          await sqsConsumerService.handleMessage(message);
        });

        console.log(`처리된 메시지 수: ${processedMessages.length}`);
        return {
          body: JSON.stringify({
            message: `${processedMessages.length}개의 메시지가 성공적으로 처리되었습니다.`,
          }),
          statusCode: 200,
        };
      }
    } catch (sqsError) {
      console.error('SQS 처리 중 오류:', sqsError);
      // SQS 서비스를 찾을 수 없거나 오류가 발생한 경우에도 일반 Lambda 처리를 계속 시도합니다
    }

    // SQS 이벤트가 아닌 경우 일반 Lambda 이벤트로 처리
    return server(event, context, callback);
  } catch (error) {
    console.error('Lambda 핸들러 오류:', error);
    return {
      body: JSON.stringify({ message: '내부 서버 오류가 발생했습니다.' }),
      statusCode: 500,
    };
  }
};
