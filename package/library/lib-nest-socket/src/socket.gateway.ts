import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3001, {
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afterInit(server: any): void {
    console.log('afterInit');
  }

  handleConnection(client: Socket): void {
    console.log('handleConnection', client.id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleDisconnect(client: any): void {
    console.log('handleDisconnect', client.id);
  }
}
