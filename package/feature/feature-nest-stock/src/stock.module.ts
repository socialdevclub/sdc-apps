import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Stock, stockSchema } from './stock.schema';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { LogModule } from './log/log.module';
import { ResultModule } from './result/result.module';
import { StockRepository } from './stock.repository';
import { UserModule } from './user/user.module';
import { OutboxModule } from './outbox/outbox.module';
import { KafkaService } from './kafka/kafka.service';

@Module({
  controllers: [StockController],
  exports: [StockService, StockRepository],
  imports: [
    MongooseModule.forFeature([{ name: Stock.name, schema: stockSchema }]),
    forwardRef(() => UserModule),
    LogModule,
    ResultModule,
    OutboxModule,
  ],
  providers: [StockService, StockRepository, KafkaService],
})
export class StockModule {}
