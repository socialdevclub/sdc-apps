import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { StockUser, userSchema } from './user.schema';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';

@Module({
  controllers: [UserController],
  exports: [UserService, UserRepository],
  imports: [MongooseModule.forFeature([{ name: StockUser.name, schema: userSchema }])],
  providers: [UserService, UserRepository],
})
export class UserModule {}
