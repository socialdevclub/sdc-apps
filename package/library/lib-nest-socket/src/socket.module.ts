import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Module({
  exports: [SocketGateway],
  providers: [SocketGateway],
})
export class SocketModule {}
