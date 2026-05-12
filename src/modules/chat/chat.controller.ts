import { Controller, Get, Post, Body, UseGuards, Req, Query, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CreateConversationDto } from './dto/chat.dto';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post('conversations')
  @UseGuards(JwtAuthGuard)
  async createConversation(@Req() req: any, @Body() dto: CreateConversationDto) {
    const conversation = await this.chatService.createConversation(req.user._id, dto);
    // If it's a support chat, notify admins
    if (dto.isSupport) {
      this.chatGateway.notifyNewConversation(conversation);
    }
    return conversation;
  }

  @Post('support/guest')
  async guestSupport(@Body() dto: CreateConversationDto) {
    const { conversation, message } = await this.chatService.createGuestConversation(dto);
    
    // Notify admins of new conversation
    this.chatGateway.notifyNewConversation(conversation);
    
    // Broadcast the automated message if it exists
    if (message) {
      this.chatGateway.broadcastMessage(conversation._id.toString(), message);
    }
    
    return conversation;
  }

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  async getConversations(@Req() req: any) {
    return this.chatService.getConversations(req.user._id);
  }

  @Get('support/guest/:id/messages')
  async getGuestMessages(
    @Param('id') conversationId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getMessages(conversationId, null, page || 1, limit || 50);
  }

  @Get('conversations/:id/messages')
  @UseGuards(JwtAuthGuard)
  async getMessages(
    @Param('id') conversationId: string,
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getMessages(conversationId, req.user._id, page || 1, limit || 50);
  }

  @Get('conversations/:id/debug-messages')
  async debugMessages(@Param('id') conversationId: string) {
    return this.chatService.debugMessages(conversationId);
  }

  @Get('support/conversations')
  @UseGuards(JwtAuthGuard)
  async getSupportConversations() {
    return this.chatService.getSupportConversations();
  }
}
