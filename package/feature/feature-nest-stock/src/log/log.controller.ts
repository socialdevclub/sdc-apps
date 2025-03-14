import { Controller, Get, Query } from '@nestjs/common';
import { LogService } from './log.service';
import { StockLog } from './log.schema';

@Controller('/stock/log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  async getLogs(
    @Query('stockId') stockId: string,
    @Query('userId') userId: string,
    @Query('round') round: number,
    @Query('company') company?: string,
  ): Promise<StockLog[]> {
    return this.logService.find(stockId, userId, round, company);
  }
}
