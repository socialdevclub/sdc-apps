import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SqsModule } from 'lib-nest-sqs';
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
    MongooseModule.forFeature([{ name: StockUser.name, schema: userSchema }]),
    forwardRef(() => StockModule),
    SqsModule.forFeature({
      queueUrl: process.env.AWS_SQS_QUEUE_URL,
      region: 'ap-northeast-2',
    }),
  ],
  providers: [UserService, UserRepository, UserProcessor],
})
export class UserModule {}
