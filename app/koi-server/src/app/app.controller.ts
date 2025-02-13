import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('log')
  log(@Query('msg') msg: string): boolean {
    fetch(
      'https://discord.com/api/webhooks/1200406597063680100/XY6ytrHRX5PtIOHxRe68zoYVIozC3G4gW_A2Kn5RkWlOatpYQ0pCeUmRfJ3rmWzvqMJu',
      {
        body: JSON.stringify({
          content: decodeURIComponent(msg),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      },
    );
    console.warn(`${decodeURIComponent(msg)} (${new Date()})`);
    return true;
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('add-topic')
  async addSubscriptionTopic(@Body('topic') topic: string): Promise<string> {
    console.log(topic);
    if (topic === undefined) {
      return 'topic is undefined';
    }
    await this.appService.addSubscriptionTopic(topic);
    return `topic ${topic} added`;
  }

  @Post('send/:topic')
  async sendMessage(@Body() msg: { value: string }, @Param('topic') topic: string): Promise<void> {
    await this.appService.sendMessage(topic, msg.value);
  }
}
