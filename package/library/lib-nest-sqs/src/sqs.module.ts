import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SqsService } from './sqs.service';
import { SqsModuleOptions, SqsOptions } from './sqs.types';

@Module({})
export class SqsModule {
  static forRoot(options: SqsModuleOptions): DynamicModule {
    const sqsOptionsProvider: Provider = {
      provide: 'SQS_OPTIONS',
      useValue: options.options,
    };

    return {
      exports: [SqsService],
      global: options.isGlobal || false,
      imports: [ConfigModule],
      module: SqsModule,
      providers: [sqsOptionsProvider, SqsService],
    };
  }

  static forFeature(options: SqsOptions): DynamicModule {
    const sqsOptionsProvider: Provider = {
      provide: 'SQS_OPTIONS',
      useValue: options,
    };

    return {
      exports: [SqsService],
      imports: [ConfigModule],
      module: SqsModule,
      providers: [sqsOptionsProvider, SqsService],
    };
  }
}
