import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { StockService } from './stock.service';
import { Stock, stockSchema } from './stock.schema';
import { StockController } from './stock.controller';
import { LogModule } from './log/log.module';
import { ResultModule } from './result/result.module';
import { StockRepository } from './stock.repository';
import { UserModule } from './user/user.module';
import { StockProcessor } from './stock.processor';

@Module({
  controllers: [StockController],
  exports: [StockService, StockRepository, StockProcessor],
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Stock.name, schema: stockSchema }]),
    forwardRef(() => UserModule),
    LogModule,
    ResultModule,
  ],
  providers: [StockService, StockRepository, StockProcessor],
})
export class StockModule {}
