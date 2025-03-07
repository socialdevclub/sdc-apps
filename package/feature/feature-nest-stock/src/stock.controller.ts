import { Body, Controller, Delete, Get, Patch, Post, Query } from '@nestjs/common';
import { Request, Response, StockSchema } from 'shared~type-stock';
import { Stock } from './stock.schema';
import { StockService } from './stock.service';
import { KafkaService } from './kafka/kafka.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService, private readonly kafkaService: KafkaService) {}

  @Get('/list')
  async getStockList(@Body() body: Request.GetStockList): Promise<Stock[]> {
    const stockList = await this.stockService.find(body);
    return stockList;
  }

  @Get()
  async getStock(@Query('stockId') stockId: string): Promise<Response.GetStock> {
    const stock = await this.stockService.findOneById(stockId);
    return this.stockService.transStockToDto(stock);
  }

  @Delete()
  async deleteStock(@Query('stockId') stockId: string): Promise<boolean> {
    return this.stockService.deleteStock(stockId);
  }

  @Get('/phase')
  async getStockPhase(@Query('stockId') stockId: string): Promise<Response.GetStockPhase> {
    const stock = await this.stockService.findOneById(stockId, { stockPhase: true });
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

  @Patch()
  updateStock(@Body() body: Request.PatchUpdateStock): Promise<StockSchema> {
    return this.stockService.findOneByIdAndUpdate(body);
  }

  @Post('/reset')
  resetStock(@Query('stockId') stockId: string): Promise<StockSchema> {
    return this.stockService.resetStock(stockId);
  }

  @Post('/result')
  saveStockResult(@Query('stockId') stockId: string): Promise<Response.Result[]> {
    return this.stockService.saveStockResult(stockId);
  }

  @Post('/init')
  initStock(@Query('stockId') stockId: string): Promise<StockSchema> {
    return this.stockService.initStock(stockId);
  }

  @Post('/buy')
  buyStock(@Body() body: Request.PostBuyStock): Promise<StockSchema> {
    return this.stockService.buyStock(body.stockId, body);
  }

  @Post('/draw-info')
  buyStockInfo(@Body() body: Request.PostDrawStockInfo): Promise<StockSchema> {
    return this.stockService.drawStockInfo(body.stockId, body);
  }

  @Post('/sell')
  sellStock(@Body() body: Request.PostSellStock): Promise<StockSchema> {
    return this.stockService.sellStock(body.stockId, body);
  }

  @Post('/finish')
  async stockFinish(@Query('stockId') stockId: string): Promise<StockSchema> {
    await this.stockService.findOneByIdAndUpdate({ _id: stockId, isTransaction: false });
    return this.stockService.allUserSellStock(stockId);
  }

  @Post('/send')
  async sendMessage(@Body() msg: { value: string; topic: string }): Promise<void> {
    if (!msg.topic) {
      throw new Error('Topic is required as a query parameter');
    }
    console.log(`Sending message to topic: ${msg.topic}`);
    await this.kafkaService.sendMessage(msg.topic, msg.value);
  }
}
