import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { LogModule } from './log/log.module';
import { StockRepository } from './stock.repository';
import { UserModule } from './user/user.module';
import { StockProcessor } from './stock.processor';

@Module({
  controllers: [StockController],
  exports: [StockService, StockRepository, StockProcessor],
  imports: [HttpModule, forwardRef(() => UserModule), LogModule],
  providers: [StockService, StockRepository, StockProcessor],
})
export class StockModule {}
