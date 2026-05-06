import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    server: Server;
    private readonly logger;
    private onlineUsers;
    constructor(jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    sendNotification(userId: string, notification: any): void;
    sendUnreadCount(userId: string, count: number): void;
    broadcastSystemAlert(title: string, message: string): void;
    isUserOnline(userId: string): boolean;
    getOnlineUsers(): string[];
    handleMarkRead(client: Socket, data: {
        notificationId: string;
    }): {
        event: string;
        id: string;
    };
}
