import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // console.log('Notification client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    // console.log('Notification client disconnected:', client.id);
  }

  sendNotification(userId: string, notification: any) {
    this.server.to(userId).emit('notification', notification);
  }

  // Join a room specific to the user ID for private notifications
  @UseGuards(WsJwtAuthGuard)
  joinUserRoom(client: any) {
    client.join(client.user._id.toString());
  }
}
