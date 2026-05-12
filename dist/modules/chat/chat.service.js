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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const conversation_schema_1 = require("../../schemas/conversation.schema");
const message_schema_1 = require("../../schemas/message.schema");
let ChatService = class ChatService {
    conversationModel;
    messageModel;
    constructor(conversationModel, messageModel) {
        this.conversationModel = conversationModel;
        this.messageModel = messageModel;
    }
    async createConversation(userId, dto) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        const participants = [new mongoose_2.Types.ObjectId(userId)];
        if (dto.participantId && mongoose_2.Types.ObjectId.isValid(dto.participantId) && dto.participantId !== userId) {
            participants.push(new mongoose_2.Types.ObjectId(dto.participantId));
        }
        if (dto.isSupport) {
            const existingSupport = await this.conversationModel.findOne({
                participants: new mongoose_2.Types.ObjectId(userId),
                isSupport: true,
            });
            if (existingSupport)
                return existingSupport;
        }
        if (!dto.isSupport && dto.participantId) {
            const existing = await this.conversationModel.findOne({
                participants: { $all: participants },
                isSupport: false,
            });
            if (existing)
                return existing;
        }
        return this.conversationModel.create({
            participants,
            isSupport: !!dto.isSupport,
            subject: dto.subject,
            guestInfo: dto.guestInfo,
        });
    }
    async createGuestConversation(dto) {
        const conversation = await this.conversationModel.create({
            participants: [],
            isSupport: true,
            subject: dto.subject || 'Guest Support Request',
            guestInfo: dto.guestInfo,
        });
        let systemMessage = null;
        if (dto.guestInfo?.name) {
            const firstName = dto.guestInfo.name.split(' ')[0];
            const greetings = [
                `Hey ${firstName}! 👋 Welcome to CampusLink. We're super excited to have you here! How can we help you today? ✨`,
                `Hello ${firstName}, welcome to the community! 🎓 Our team is here to assist you with anything you need. What's on your mind?`,
                `Hi ${firstName}! ✨ Thanks for reaching out to CampusLink. One of our student ambassadors will be with you shortly. In the meantime, feel free to ask your question! 🚀`
            ];
            const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
            systemMessage = await this.messageModel.create({
                conversation: conversation._id,
                type: message_schema_1.MessageType.TEXT,
                content: randomGreeting,
                isSystem: true
            });
            if (systemMessage) {
                await this.conversationModel.findByIdAndUpdate(conversation._id, {
                    lastMessage: systemMessage._id,
                });
            }
        }
        return { conversation, message: systemMessage };
    }
    async getConversationById(id) {
        return this.conversationModel.findById(id).exec();
    }
    async getConversations(userId) {
        return this.conversationModel
            .find({ participants: userId })
            .populate('participants', 'name email avatar role')
            .populate('lastMessage')
            .sort('-updatedAt')
            .exec();
    }
    async getMessages(conversationId, userId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        return this.messageModel
            .find({ conversation: conversationId })
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .populate('sender', 'name avatar')
            .exec();
    }
    async sendMessage(userId, dto) {
        const isGuest = userId.startsWith('guest_');
        const messageData = {
            conversation: new mongoose_2.Types.ObjectId(dto.conversationId),
            type: dto.type,
            content: dto.content,
            mediaUrl: dto.mediaUrl,
            mediaSize: dto.mediaSize,
            mediaDuration: dto.mediaDuration,
        };
        if (isGuest) {
            const conv = await this.conversationModel.findById(dto.conversationId);
            if (conv && conv.guestInfo) {
                messageData.guestSender = conv.guestInfo;
            }
        }
        else {
            messageData.sender = new mongoose_2.Types.ObjectId(userId);
        }
        const message = await this.messageModel.create(messageData);
        await this.conversationModel.findByIdAndUpdate(dto.conversationId, {
            lastMessage: message._id,
            updatedAt: new Date(),
        });
        return message.populate('sender', 'name avatar');
    }
    async markAsRead(messageId, userId) {
        const isGuest = userId.startsWith('guest_');
        const update = { isRead: true };
        if (!isGuest) {
            update.$addToSet = { readBy: new mongoose_2.Types.ObjectId(userId) };
        }
        return this.messageModel.findByIdAndUpdate(messageId, update, { new: true });
    }
    async getSupportConversations() {
        return this.conversationModel
            .find({ isSupport: true })
            .populate('participants', 'name email avatar role')
            .populate('lastMessage')
            .sort('-updatedAt')
            .exec();
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(conversation_schema_1.Conversation.name)),
    __param(1, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ChatService);
//# sourceMappingURL=chat.service.js.map