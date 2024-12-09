import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockService } from './stock.service';
import { Stock, stockSchema } from './stock.schema';
import { StockController } from './stock.controller';
import { UserModule } from './user/user.module';
import { LogModule } from './log/log.module';
import { ResultModule } from './result/result.module';
import { StockRepository } from './stock.repository';

@Module({
  controllers: [StockController],
  imports: [
    MongooseModule.forFeature([{ name: Stock.name, schema: stockSchema }]),
    UserModule,
    LogModule,
    ResultModule,
  ],
  providers: [StockService, StockRepository],
})
export class StockModule {}
