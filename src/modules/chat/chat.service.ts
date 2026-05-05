import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from '../../schemas/conversation.schema';
import { Message, MessageDocument, MessageType } from '../../schemas/message.schema';
import { SendMessageDto, CreateConversationDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async createConversation(userId: string, dto: CreateConversationDto) {
    const participants = [new Types.ObjectId(userId), new Types.ObjectId(dto.participantId)];
    
    // Check if conversation already exists for non-support chats
    if (!dto.isSupport) {
      const existing = await this.conversationModel.findOne({
        participants: { $all: participants },
        isSupport: false,
      });
      if (existing) return existing;
    }

    return this.conversationModel.create({
      participants,
      isSupport: !!dto.isSupport,
      subject: dto.subject,
    });
  }

  async getConversations(userId: string) {
    return this.conversationModel
      .find({ participants: userId })
      .populate('participants', 'name email avatar role')
      .populate('lastMessage')
      .sort('-updatedAt')
      .exec();
  }

  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return this.messageModel
      .find({ conversation: conversationId })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name avatar')
      .exec();
  }

  async sendMessage(userId: string, dto: SendMessageDto) {
    const message = await this.messageModel.create({
      conversation: new Types.ObjectId(dto.conversationId),
      sender: new Types.ObjectId(userId),
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

  async markAsRead(messageId: string, userId: string) {
    return this.messageModel.findByIdAndUpdate(
      messageId,
      { $addToSet: { readBy: new Types.ObjectId(userId) }, isRead: true },
      { new: true },
    );
  }

  async getSupportConversations() {
    return this.conversationModel
      .find({ isSupport: true })
      .populate('participants', 'name email avatar role')
      .populate('lastMessage')
      .sort('-updatedAt')
      .exec();
  }
}
