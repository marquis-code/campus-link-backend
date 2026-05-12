import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const participants = [new Types.ObjectId(userId)];
    if (dto.participantId && Types.ObjectId.isValid(dto.participantId) && dto.participantId !== userId) {
      participants.push(new Types.ObjectId(dto.participantId));
    }
    
    // Check for existing support conversation for this user
    if (dto.isSupport) {
      const existingSupport = await this.conversationModel.findOne({
        participants: new Types.ObjectId(userId),
        isSupport: true,
      });
      if (existingSupport) return existingSupport;
    }

    // Check if conversation already exists for non-support chats
    if (!dto.isSupport && dto.participantId) {
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
      guestInfo: dto.guestInfo,
    });
  }

  async createGuestConversation(dto: CreateConversationDto) {
    const conversation = await this.conversationModel.create({
      participants: [], // No registered participants yet
      isSupport: true,
      subject: dto.subject || 'Guest Support Request',
      guestInfo: dto.guestInfo,
    });

    // Create automated personalized greeting
    let systemMessage: any = null;
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
        type: MessageType.TEXT,
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

  async getConversationById(id: string) {
    return this.conversationModel.findById(id).exec();
  }

  async getConversations(userId: string) {
    return this.conversationModel
      .find({ participants: new Types.ObjectId(userId) })
      .populate('participants', 'name email avatar role')
      .populate('lastMessage')
      .sort('-updatedAt')
      .exec();
  }

  async getMessages(conversationId: string, userId: string | null, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return this.messageModel
      .find({ conversation: new Types.ObjectId(conversationId) })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name avatar')
      .exec();
  }

  async debugMessages(conversationId: string) {
    const stringQuery = await this.messageModel.find({ conversation: conversationId }).exec();
    const objectIdQuery = await this.messageModel.find({ conversation: new Types.ObjectId(conversationId) }).exec();
    return {
      conversationId,
      stringQueryCount: stringQuery.length,
      objectIdQueryCount: objectIdQuery.length,
      stringQuerySample: stringQuery.slice(0, 2),
      objectIdQuerySample: objectIdQuery.slice(0, 2)
    };
  }

  async sendMessage(userId: string, dto: SendMessageDto) {
    const isGuest = userId.startsWith('guest_');
    const messageData: any = {
      conversation: new Types.ObjectId(dto.conversationId),
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
    } else {
      messageData.sender = new Types.ObjectId(userId);
    }

    const message = await this.messageModel.create(messageData);

    await this.conversationModel.findByIdAndUpdate(dto.conversationId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    return message.populate('sender', 'name avatar');
  }

  async markAsRead(messageId: string, userId: string) {
    const isGuest = userId.startsWith('guest_');
    const update: any = { isRead: true };
    
    if (!isGuest) {
      update.$addToSet = { readBy: new Types.ObjectId(userId) };
    }

    return this.messageModel.findByIdAndUpdate(
      messageId,
      update,
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
