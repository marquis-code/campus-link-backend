"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let NotificationsGateway = NotificationsGateway_1 = class NotificationsGateway {
    jwtService;
    server;
    logger = new common_1.Logger(NotificationsGateway_1.name);
    onlineUsers = new Map();
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token || client.handshake.query?.token;
            if (!token) {
                client.disconnect();
                return;
            }
            const decoded = this.jwtService.verify(token);
            const userId = decoded.sub;
            client.userId = userId;
            client.join(userId);
            if (!this.onlineUsers.has(userId)) {
                this.onlineUsers.set(userId, new Set());
            }
            this.onlineUsers.get(userId).add(client.id);
            this.server.emit('user_online', { userId, online: true });
            this.logger.log(`User ${userId} connected (${this.onlineUsers.get(userId).size} sessions)`);
        }
        catch (e) {
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = client.userId;
        if (!userId)
            return;
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
    sendNotification(userId, notification) {
        this.server.to(userId).emit('notification', notification);
    }
    sendUnreadCount(userId, count) {
        this.server.to(userId).emit('unread_count', { count });
    }
    broadcastSystemAlert(title, message) {
        this.server.emit('system_alert', { title, message, timestamp: new Date() });
    }
    isUserOnline(userId) {
        return this.onlineUsers.has(userId) && (this.onlineUsers.get(userId)?.size || 0) > 0;
    }
    getOnlineUsers() {
        return Array.from(this.onlineUsers.keys());
    }
    handleMarkRead(client, data) {
        return { event: 'marked', id: data.notificationId };
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], NotificationsGateway.prototype, "handleMarkRead", null);
exports.NotificationsGateway = NotificationsGateway = NotificationsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: '/notifications',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map