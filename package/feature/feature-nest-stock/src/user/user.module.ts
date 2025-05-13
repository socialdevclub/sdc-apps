import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { StockModule } from '../stock.module';
import { UserProcessor } from './user.processor';

@Module({
  controllers: [UserController],
  exports: [UserService, UserRepository, UserProcessor],
  imports: [HttpModule, forwardRef(() => StockModule)],
  providers: [UserService, UserRepository, UserProcessor],
})
export class UserModule {}
