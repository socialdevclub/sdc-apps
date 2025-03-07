import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PollModule } from 'feature-nest-poll';
import { StockModule } from 'feature-nest-stock';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PartyModule } from './party/party.module';
import { KafkaModule } from '../../../../package/feature/feature-nest-stock/src/kafka/kafka.module';
import kafkaConfig from '../config/kafka.config';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [kafkaConfig],
    }),
    MongooseModule.forRoot(process.env.MONGO_URI, {
      ignoreUndefined: true,
      maxIdleTimeMS: 60000,
    }),
    PollModule,
    StockModule,
    PartyModule,
    KafkaModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        brokers: configService.get<string[]>('kafka.brokers') || [],
        clientId: configService.get<string>('kafka.clientId') || '',
        groupId: configService.get<string>('kafka.groupId') || '',
      }),
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
