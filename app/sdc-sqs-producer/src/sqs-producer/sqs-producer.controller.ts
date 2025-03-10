import { Body, Controller, Post } from '@nestjs/common';
import { Request, Response } from 'shared~type-stock';
import { SqsProducerService } from './sqs-producer.service';

@Controller('queue')
export class SqsProducerController {
  constructor(private readonly sqsProducerService: SqsProducerService) {}

  @Post('/stock/user/register')
  registerStockUser(@Body() body: Request.PostCreateUser): Promise<Response.GetCreateUser> {
    return this.sqsProducerService.registerStockUser(body);
  }
}
