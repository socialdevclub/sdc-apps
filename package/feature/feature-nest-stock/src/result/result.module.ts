import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResultController } from './result.controller';
import { ResultService } from './result.service';
import { Result, resultSchema } from './result.schema';

@Module({
  controllers: [ResultController],
  exports: [ResultService],
  imports: [MongooseModule.forFeature([{ name: Result.name, schema: resultSchema }])],
  providers: [ResultService],
})
export class ResultModule {}
