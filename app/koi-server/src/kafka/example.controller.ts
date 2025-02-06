import { Controller, Post, Body } from '@nestjs/common';
import { LockService } from './lock.service';

@Controller('distributed-lock')
export class LockController {
  constructor(private readonly lockService: LockService) {}

  @Post('process')
  async processWithLock(
    @Body() body: { resourceId: string; data: unknown },
  ): Promise<{ message: string; success: boolean }> {
    const { resourceId, data } = body;

    try {
      const lockAcquired = await this.lockService.acquireLock(resourceId);
      if (!lockAcquired) {
        return { message: '리소스가 현재 사용 중입니다', success: false };
      }

      try {
        await this.processData(data);
        return { message: '처리가 완료되었습니다', success: true };
      } finally {
        await this.lockService.releaseLock(resourceId);
      }
    } catch (error) {
      return { message: '처리 중 오류가 발생했습니다.', success: false };
    }
  }

  private async processData(data: unknown): Promise<void> {
    // TODO: 실제 비즈니스 로직 구현
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }
}
