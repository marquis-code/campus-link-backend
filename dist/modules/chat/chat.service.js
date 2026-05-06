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
        const participants = [new mongoose_2.Types.ObjectId(userId), new mongoose_2.Types.ObjectId(dto.participantId)];
        if (!dto.isSupport) {
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
        });
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
        const message = await this.messageModel.create({
            conversation: new mongoose_2.Types.ObjectId(dto.conversationId),
            sender: new mongoose_2.Types.ObjectId(userId),
            type: dto.type,
            content: dto.content,
            mediaUrl: dto.mediaUrl,
            mediaSize: dto.mediaSize,
            mediaDuration: dto.mediaDuration,
        });
        await this.conversationModel.findByIdAndUpdate(dto.conversationId, {
            lastMessage: message._id,
            updatedAt: new Date(),
        });
        return message.populate('sender', 'name avatar');
    }
    async markAsRead(messageId, userId) {
        return this.messageModel.findByIdAndUpdate(messageId, { $addToSet: { readBy: new mongoose_2.Types.ObjectId(userId) }, isRead: true }, { new: true });
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