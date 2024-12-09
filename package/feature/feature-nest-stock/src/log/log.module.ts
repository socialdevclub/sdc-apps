import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogController } from './log.controller';
import { LogService } from './log.service';
import { StockLog, stockLogSchema } from './log.schema';
import { LogRepository } from './log.repository';

@Module({
  controllers: [LogController],
  exports: [LogService, LogRepository],
  imports: [MongooseModule.forFeature([{ name: StockLog.name, schema: stockLogSchema }])],
  providers: [LogService, LogRepository],
})
export class LogModule {}
