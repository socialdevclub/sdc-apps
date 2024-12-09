import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { Request, Response } from 'shared~type-stock';
import { UserService } from './user.service';
import { StockUser } from './user.schema';

@Controller('/stock/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(@Query('stockId') stockId: string): Promise<Response.GetStockUser[]> {
    const users = await this.userService.getUserList(stockId);
    return users.map((user) => this.userService.transStockUserToDto(user));
  }

  @Post()
  setUser(@Body() body: StockUser): Promise<StockUser> {
    return this.userService.setUser(body);
  }

  @Delete()
  async removeUser(@Body() body: Request.RemoveStockUser): Promise<{ result: boolean }> {
    return { result: !!(await this.userService.removeUser(body.stockId, body.userId)) };
  }

  @Delete('/all')
  async removeAllUser(@Query('stockId') stockId: string): Promise<{ result: boolean }> {
    return { result: !!(await this.userService.removeAllUser(stockId)) };
  }
}
