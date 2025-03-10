import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StockService } from './stock.service';
import { Stock, stockSchema } from './stock.schema';
import { StockController } from './stock.controller';
import { LogModule } from './log/log.module';
import { ResultModule } from './result/result.module';
import { StockRepository } from './stock.repository';
import { UserModule } from './user/user.module';

@Module({
  controllers: [StockController],
  exports: [StockService, StockRepository],
  imports: [
    MongooseModule.forFeature([{ name: Stock.name, schema: stockSchema }]),
    forwardRef(() => UserModule),
    LogModule,
    ResultModule,
  ],
  providers: [StockService, StockRepository],
})
export class StockModule {}
