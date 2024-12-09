import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app/app.module';
import { commonConfig } from '../src/main';

// https://docs.nestjs.com/recipes/hot-reload
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const module: any;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { cors: true });
  commonConfig(app);
  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
