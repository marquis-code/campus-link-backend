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
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private userSockets = new Map<string, Set<string>>(); // userId -> Set<socketId>
  private socketUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private readonly chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      const guestId = client.handshake.auth?.guestId || client.handshake.query?.guestId;

      let userId: string;
      let role: string | undefined = undefined;

      if (guestId) {
        userId = `guest_${guestId}`;
      } else if (token) {
        const decoded = this.jwtService.verify(token as string);
        userId = decoded.sub;
        role = decoded.role;
      } else {
        client.disconnect();
        return;
      }

      (client as any).userId = userId;
      (client as any).role = role;
      this.socketUsers.set(client.id, userId);

      // Track user sessions
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Auto-join user's personal room for DMs
      client.join(`user_${userId}`);

      // Join admins to a dedicated room for support notifications
      if (role === 'admin') {
        client.join('admins');
        this.logger.log(`Chat: Admin ${userId} joined admins room`);
      }

      // Broadcast presence
      this.server.emit('presence', { userId, online: true });
      this.logger.log(`Chat: User ${userId} connected`);
    } catch (e) {
      this.logger.error(`Connection error: ${e.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketUsers.get(client.id);
    if (!userId) return;

    this.socketUsers.delete(client.id);
    const sessions = this.userSockets.get(userId);
    if (sessions) {
      sessions.delete(client.id);
      if (sessions.size === 0) {
        this.userSockets.delete(userId);
        this.server.emit('presence', { userId, online: false });
      }
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoinRoom(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conv_${data.conversationId}`);
    this.logger.log(`User joined conversation ${data.conversationId}`);
    return { event: 'joined', room: data.conversationId };
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveRoom(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`conv_${data.conversationId}`);
    return { event: 'left', room: data.conversationId };
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ) {
    try {
      const userId = (client as any).userId;
      if (!userId) return;

      const message = await this.chatService.sendMessage(userId, dto);

      // Broadcast to all users in the conversation room
      this.server.to(`conv_${dto.conversationId}`).emit('new_message', message);

      // Notify participants not in the room
      const conversation = await this.chatService.getConversationById(dto.conversationId);
      if (conversation) {
        // If it's a support conversation, also notify all online admins
        if (conversation.isSupport) {
          this.server.to('admins').emit('message_notification', {
            conversationId: dto.conversationId,
            message,
            senderName: (message as any).sender?.name || (message as any).guestSender?.name || 'Guest',
          });
        }

        for (const participant of conversation.participants) {
          const pId = participant.toString();
          if (pId !== userId) {
            // Send to their personal room (they may not be in the conversation room)
            this.server.to(`user_${pId}`).emit('message_notification', {
              conversationId: dto.conversationId,
              message,
              senderName: (message as any).sender?.name || (message as any).guestSender?.name || 'Someone',
            });
          }
        }
      }

      return message;
    } catch (error) {
      this.logger.error(`Failed to handle send_message: ${error.message}`, error.stack);
      client.emit('error', { message: 'Failed to send message', error: error.message });
      throw error;
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    const userId = (client as any).userId;
    if (!userId) return;

    client.to(`conv_${data.conversationId}`).emit('user_typing', {
      userId,
      conversationId: data.conversationId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; messageId: string },
  ) {
    const userId = (client as any).userId;
    if (!userId) return;

    await this.chatService.markAsRead(data.messageId, userId);

    // Notify the sender that their message was read
    this.server.to(`conv_${data.conversationId}`).emit('message_read', {
      messageId: data.messageId,
      readBy: userId,
      conversationId: data.conversationId,
    });
  }

  /**
   * Notify admins about a new support conversation
   */
  notifyNewConversation(conversation: any) {
    this.server.to('admins').emit('new_conversation', conversation);
  }

  /**
   * Broadcast a message to a conversation room
   */
  broadcastMessage(conversationId: string, message: any) {
    this.server.to(`conv_${conversationId}`).emit('new_message', message);
  }

  /**
   * Check if user is online in chat namespace.
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && (this.userSockets.get(userId)?.size || 0) > 0;
  }
}
