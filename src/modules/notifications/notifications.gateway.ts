import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private onlineUsers = new Map<string, Set<string>>(); // userId -> Set<socketId>

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const decoded = this.jwtService.verify(token as string);
      const userId = decoded.sub;
      (client as any).userId = userId;

      // Join user's private room
      client.join(userId);

      // Track online presence
      if (!this.onlineUsers.has(userId)) {
        this.onlineUsers.set(userId, new Set());
      }
      this.onlineUsers.get(userId)!.add(client.id);

      // Broadcast online status
      this.server.emit('user_online', { userId, online: true });
      this.logger.log(
        `User ${userId} connected (${this.onlineUsers.get(userId)!.size} sessions)`,
      );
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (!userId) return;

    const sessions = this.onlineUsers.get(userId);
    if (sessions) {
      sessions.delete(client.id);
      if (sessions.size === 0) {
        this.onlineUsers.delete(userId);
        this.server.emit('user_online', { userId, online: false });
        this.logger.log(`User ${userId} went offline`);
      }
    }
  }

  /**
   * Push a real-time notification to a specific user.
   * Works across all their connected sessions.
   */
  sendNotification(userId: string, notification: any) {
    this.server.to(userId).emit('notification', notification);
  }

  /**
   * Push unread count update to user.
   */
  sendUnreadCount(userId: string, count: number) {
    this.server.to(userId).emit('unread_count', { count });
  }

  /**
   * Broadcast to all connected clients (system alerts).
   */
  broadcastSystemAlert(title: string, message: string) {
    this.server.emit('system_alert', { title, message, timestamp: new Date() });
  }

  /**
   * Check if a user is currently online.
   */
  isUserOnline(userId: string): boolean {
    return (
      this.onlineUsers.has(userId) &&
      (this.onlineUsers.get(userId)?.size || 0) > 0
    );
  }

  /**
   * Get all online user IDs.
   */
  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers.keys());
  }

  @SubscribeMessage('mark_read')
  handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    // Client acknowledges a notification was read — handled by the REST API
    return { event: 'marked', id: data.notificationId };
  }
}
