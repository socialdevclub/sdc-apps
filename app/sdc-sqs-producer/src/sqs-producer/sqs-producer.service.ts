import { Injectable } from '@nestjs/common';
import { SqsService } from 'lib-nest-sqs';
import { Request, Response } from 'shared~type-stock';

@Injectable()
export class SqsProducerService {
  constructor(private readonly sqsService: SqsService) {}

  async registerStockUser(body: Request.PostCreateUser): Promise<Response.GetCreateUser> {
    const messageId = await this.sqsService.sendMessage('registerUser', body);
    return { messageId };
  }

  async buyStock(body: Request.PostBuyStock): Promise<Response.GetCreateUser> {
    const messageId = await this.sqsService.sendMessage('/stock/buy', body);
    return { messageId };
  }

  async sellStock(body: Request.PostSellStock): Promise<Response.GetCreateUser> {
    const messageId = await this.sqsService.sendMessage('/stock/sell', body);
    return { messageId };
  }
}
