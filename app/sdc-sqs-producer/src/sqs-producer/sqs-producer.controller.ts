import { Body, Controller, Post } from '@nestjs/common';
import type { Request, Response } from 'shared~type-stock';
import { SqsProducerService } from './sqs-producer.service';

@Controller('queue')
export class SqsProducerController {
  constructor(private readonly sqsProducerService: SqsProducerService) {}

  @Post('/stock/user/register')
  registerStockUser(@Body() body: Request.PostCreateUser): Promise<Response.GetCreateUser> {
    return this.sqsProducerService.registerStockUser(body);
  }

  @Post('/stock/buy')
  buyStock(@Body() body: Request.PostBuyStock): Promise<Response.GetCreateUser> {
    return this.sqsProducerService.buyStock(body);
  }

  @Post('/stock/sell')
  sellStock(@Body() body: Request.PostSellStock): Promise<Response.GetCreateUser> {
    return this.sqsProducerService.sellStock(body);
  }
}
