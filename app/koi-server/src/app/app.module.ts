import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PollModule } from 'feature-nest-poll';
import { StockModule } from 'feature-nest-stock';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PartyModule } from './party/party.module';

@Module({
  controllers: [AppController],
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI, {
      ignoreUndefined: true,
      maxIdleTimeMS: 60000,
    }),
    PollModule,
    StockModule,
    PartyModule,
  ],
  providers: [AppService],
})
export class AppModule {}
