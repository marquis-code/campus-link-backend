import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt.guard';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    // console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    // console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(@MessageBody() conversationId: string, @ConnectedSocket() client: Socket) {
    client.join(conversationId);
    return { event: 'joined', room: conversationId };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@MessageBody() conversationId: string, @ConnectedSocket() client: Socket) {
    client.leave(conversationId);
    return { event: 'left', room: conversationId };
  }

  @SubscribeMessage('send_message')
  @UseGuards(WsJwtAuthGuard)
  async handleMessage(
    @ConnectedSocket() client: any,
    @MessageBody() dto: SendMessageDto,
  ) {
    const userId = client.user._id;
    const message = await this.chatService.sendMessage(userId, dto);
    
    // Broadcast to the room
    this.server.to(dto.conversationId).emit('new_message', message);
    
    // Also notify participants who are not in the room (aggressive notification)
    // This part can be expanded to trigger push notifications/emails
    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: any,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    client.to(data.conversationId).emit('user_typing', {
      userId: client.user?._id,
      isTyping: data.isTyping,
    });
  }
}
