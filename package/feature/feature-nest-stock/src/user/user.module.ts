import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { StockModule } from '../stock.module';
import { UserProcessor } from './user.processor';
import { Stock, stockSchema } from '../stock.schema';

@Module({
  controllers: [UserController],
  exports: [UserService, UserRepository, UserProcessor],
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Stock.name, schema: stockSchema }]),
    forwardRef(() => StockModule),
  ],
  providers: [UserService, UserRepository, UserProcessor],
})
export class UserModule {}
