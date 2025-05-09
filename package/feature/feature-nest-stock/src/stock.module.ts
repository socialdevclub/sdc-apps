import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { LogModule } from './log/log.module';
import { ResultModule } from './result/result.module';
import { StockRepository } from './stock.repository';
import { UserModule } from './user/user.module';
import { StockProcessor } from './stock.processor';
import { DynamoDBModule } from './dynamodb/dynamodb.module';

@Module({
  controllers: [StockController],
  exports: [StockService, StockRepository, StockProcessor],
  imports: [HttpModule, DynamoDBModule, forwardRef(() => UserModule), LogModule, ResultModule],
  providers: [StockService, StockRepository, StockProcessor],
})
export class StockModule {}
