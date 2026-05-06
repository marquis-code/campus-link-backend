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
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const chat_service_1 = require("./chat.service");
const chat_dto_1 = require("./dto/chat.dto");
let ChatGateway = ChatGateway_1 = class ChatGateway {
    chatService;
    jwtService;
    server;
    logger = new common_1.Logger(ChatGateway_1.name);
    userSockets = new Map();
    socketUsers = new Map();
    constructor(chatService, jwtService) {
        this.chatService = chatService;
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
            this.socketUsers.set(client.id, userId);
            if (!this.userSockets.has(userId)) {
                this.userSockets.set(userId, new Set());
            }
            this.userSockets.get(userId).add(client.id);
            client.join(`user_${userId}`);
            this.server.emit('presence', { userId, online: true });
            this.logger.log(`Chat: User ${userId} connected`);
        }
        catch (e) {
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = this.socketUsers.get(client.id);
        if (!userId)
            return;
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
    handleJoinRoom(data, client) {
        client.join(`conv_${data.conversationId}`);
        this.logger.log(`User joined conversation ${data.conversationId}`);
        return { event: 'joined', room: data.conversationId };
    }
    handleLeaveRoom(data, client) {
        client.leave(`conv_${data.conversationId}`);
        return { event: 'left', room: data.conversationId };
    }
    async handleMessage(client, dto) {
        const userId = client.userId;
        if (!userId)
            return;
        const message = await this.chatService.sendMessage(userId, dto);
        this.server.to(`conv_${dto.conversationId}`).emit('new_message', message);
        const conversation = await this.chatService.getConversationById(dto.conversationId);
        if (conversation) {
            for (const participant of conversation.participants) {
                const pId = participant.toString();
                if (pId !== userId) {
                    this.server.to(`user_${pId}`).emit('message_notification', {
                        conversationId: dto.conversationId,
                        message,
                        senderName: message.sender?.name || 'Someone',
                    });
                }
            }
        }
        return message;
    }
    handleTyping(client, data) {
        const userId = client.userId;
        if (!userId)
            return;
        client.to(`conv_${data.conversationId}`).emit('user_typing', {
            userId,
            conversationId: data.conversationId,
            isTyping: data.isTyping,
        });
    }
    async handleMarkRead(client, data) {
        const userId = client.userId;
        if (!userId)
            return;
        await this.chatService.markAsRead(data.messageId, userId);
        this.server.to(`conv_${data.conversationId}`).emit('message_read', {
            messageId: data.messageId,
            readBy: userId,
            conversationId: data.conversationId,
        });
    }
    isUserOnline(userId) {
        return this.userSockets.has(userId) && (this.userSockets.get(userId)?.size || 0) > 0;
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_conversation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_conversation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        chat_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkRead", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: '/chat',
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        jwt_1.JwtService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map