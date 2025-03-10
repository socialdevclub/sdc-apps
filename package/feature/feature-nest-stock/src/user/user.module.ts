import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { UserService } from './user.service';
import { StockUser, userSchema } from './user.schema';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { StockModule } from '../stock.module';
import { UserProcessor } from './user.processor';

@Module({
  controllers: [UserController],
  exports: [UserService, UserRepository, UserProcessor],
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: StockUser.name, schema: userSchema }]),
    forwardRef(() => StockModule),
  ],
  providers: [UserService, UserRepository, UserProcessor],
})
export class UserModule {}
