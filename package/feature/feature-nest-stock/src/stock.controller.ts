import { Body, Controller, Delete, Get, HttpException, HttpStatus, Patch, Post, Query } from '@nestjs/common';
import type { Request, Response, StockSchema } from 'shared~type-stock';
import { HttpService } from '@nestjs/axios';
import { randomUUID } from 'crypto';
import type { Stock } from './stock.schema';
import { StockService } from './stock.service';
import { StockProcessor } from './stock.processor';
import { LogService } from './log/log.service';
import { StockLog } from './log/log.schema';

@Controller('stock')
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly httpService: HttpService,
    private readonly stockProcessor: StockProcessor,
    private readonly logService: LogService,
  ) {}

  @Get()
  async getStock(@Query('stockId') stockId: string): Promise<Response.GetStock> {
    const stock = await this.stockService.findOneById(stockId);
    if (!stock) {
      throw new HttpException('Stock not found', HttpStatus.NOT_FOUND);
    }

    return stock;
  }

  @Patch()
  updateStock(@Body() body: Request.PatchUpdateStock): Promise<StockSchema> {
    return this.stockService.findOneByIdAndUpdate(body);
  }

  @Delete()
  async deleteStock(@Query('stockId') stockId: string): Promise<boolean> {
    return this.stockService.deleteStock(stockId);
  }

  @Get('/list')
  async getStockList(): Promise<Stock[]> {
    const stockList = await this.stockService.find();
    return stockList;
  }

  @Get('/phase')
  async getStockPhase(@Query('stockId') stockId: string): Promise<Response.GetStockPhase> {
    const stock = await this.stockService.findOneById(stockId);
    return { stockPhase: stock.stockPhase };
  }

  @Post('/phase')
  async setStockPhase(@Body() body: Request.PostSetStockPhase): Promise<StockSchema> {
    return this.stockService.setStockPhase(body.stockId, body.phase);
  }

  @Post('/create')
  createStock(): Promise<StockSchema> {
    return this.stockService.createStock();
  }

  @Post('/reset')
  resetStock(@Query('stockId') stockId: string): Promise<StockSchema> {
    return this.stockService.resetStock(stockId);
  }

  @Post('/init')
  initStock(@Query('stockId') stockId: string): Promise<StockSchema> {
    return this.stockService.initStock(stockId);
  }

  @Post('/buy')
  async buyStock(@Body() body: Request.PostBuyStock): Promise<{ messageId: string }> {
    const queueUniqueId = randomUUID();

    // SQS 관련 로직 (지금은 안씀)
    if (false) {
      await this.logService.addLog(
        new StockLog({
          action: 'BUY',
          company: body.company,
          date: new Date(),
          price: body.unitPrice * body.amount,
          quantity: body.amount,
          queueId: queueUniqueId,
          round: body.round,
          status: 'QUEUING',
          stockId: body.stockId,
          userId: body.userId,
        }),
      );

      return this.httpService.axiosRef
        .post('https://api.socialdev.club/queue/stock/buy', { ...body, queueUniqueId })
        .then(async (res) => {
          return res.data;
        })
        .catch(async (error) => {
          console.error(error);
          await this.stockProcessor.buyStock(body.stockId, body, { queueMessageId: queueUniqueId });
          return { messageId: 'direct' };
        });
    }

    await this.stockProcessor.buyStock(body.stockId, body, { queueMessageId: queueUniqueId });
    return { messageId: 'direct' };
  }

  @Post('/draw-info')
  buyStockInfo(@Body() body: Request.PostDrawStockInfo): Promise<StockSchema> {
    return this.stockService.drawStockInfo(body.stockId, body);
  }

  @Post('/sell')
  async sellStock(@Body() body: Request.PostSellStock): Promise<{ messageId: string }> {
    const queueUniqueId = randomUUID();

    // SQS 관련 로직 (지금은 안씀)
    if (false) {
      await this.logService.addLog(
        new StockLog({
          action: 'SELL',
          company: body.company,
          date: new Date(),
          price: body.unitPrice * body.amount,
          quantity: body.amount,
          queueId: queueUniqueId,
          round: body.round,
          status: 'QUEUING',
          stockId: body.stockId,
          userId: body.userId,
        }),
      );

      return this.httpService.axiosRef
        .post('https://api.socialdev.club/queue/stock/sell', { ...body, queueUniqueId })
        .then(async (res) => {
          return res.data;
        })
        .catch(async (error) => {
          console.error(error);
          await this.stockProcessor.sellStock(body.stockId, body, { queueMessageId: queueUniqueId });
          return { messageId: 'direct' };
        });
    }

    await this.stockProcessor.sellStock(body.stockId, body, { queueMessageId: queueUniqueId });
    return { messageId: 'direct' };
  }

  @Post('/finish')
  async stockFinish(@Query('stockId') stockId: string): Promise<StockSchema> {
    await this.stockService.findOneByIdAndUpdate({ _id: stockId, isTransaction: false });
    return this.stockService.allUserSellStock(stockId);
  }
}
