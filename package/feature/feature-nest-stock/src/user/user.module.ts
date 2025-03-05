import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { StockUser, userSchema } from './user.schema';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { StockModule } from '../stock.module';

@Module({
  controllers: [UserController],
  exports: [UserService, UserRepository],
  imports: [MongooseModule.forFeature([{ name: StockUser.name, schema: userSchema }]), forwardRef(() => StockModule)],
  providers: [UserService, UserRepository],
})
export class UserModule {}
