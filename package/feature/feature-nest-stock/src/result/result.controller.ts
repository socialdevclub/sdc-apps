import { Controller, Get, Query } from '@nestjs/common';
import { ResultService } from './result.service';
import { Result } from './result.schema';

@Controller('/stock/result')
export class ResultController {
  constructor(private readonly resultService: ResultService) {}

  @Get()
  getResults(@Query('stockId') stockId: string): Promise<Result[]> {
    return this.resultService.getResults({ stockId });
  }
}
