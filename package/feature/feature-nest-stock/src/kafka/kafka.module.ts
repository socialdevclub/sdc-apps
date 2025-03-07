import { Module, DynamicModule, Type, ForwardReference, Abstract } from '@nestjs/common';
import { KafkaService } from './kafka.service';

export interface KafkaModuleOptions {
  brokers: string[];
  clientId: string;
  groupId: string;
}

type ModuleType = Type<unknown> | DynamicModule | Promise<DynamicModule> | ForwardReference<unknown>;

export interface KafkaModuleAsyncOptions {
  imports?: ModuleType[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => Promise<KafkaModuleOptions> | KafkaModuleOptions;
  // eslint-disable-next-line @typescript-eslint/ban-types
  inject?: Array<Type<unknown> | string | symbol | Abstract<unknown> | Function>;
}

@Module({
  exports: [KafkaService],
  providers: [KafkaService],
})
export class KafkaModule {
  static forRoot(options: KafkaModuleOptions): DynamicModule {
    return {
      exports: [KafkaService],
      global: true,
      module: KafkaModule,
      providers: [
        {
          provide: 'KAFKA_OPTIONS',
          useValue: options,
        },
        KafkaService,
      ],
    };
  }

  static forRootAsync(options: KafkaModuleAsyncOptions): DynamicModule {
    return {
      exports: [KafkaService],
      global: true,
      imports: options.imports || [],
      module: KafkaModule,
      providers: [
        {
          inject: options.inject || [],
          provide: 'KAFKA_OPTIONS',
          useFactory: options.useFactory,
        },
        KafkaService,
      ],
    };
  }
}
