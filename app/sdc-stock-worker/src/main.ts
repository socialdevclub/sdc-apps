import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { awsLambdaFastify } from '@fastify/aws-lambda';
import { Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';

let cachedHandler: Handler;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  await app.init();
  const fastifyInstance = app.getHttpAdapter().getInstance();
  return awsLambdaFastify(fastifyInstance);
}

export const handler: Handler = async (event: unknown, context: Context) => {
  if (!cachedHandler) {
    cachedHandler = await bootstrap();
  }
  return cachedHandler(event, context);
};

// 로컬 개발 환경에서 실행할 경우
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  (async () => {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
    await app.listen(3001);
    console.log('Worker application is running on port 3001');
  })();
}
