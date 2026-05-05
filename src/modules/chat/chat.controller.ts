import { Controller, Get, Post, Body, UseGuards, Req, Query, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/chat.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  async createConversation(@Req() req: any, @Body() dto: CreateConversationDto) {
    return this.chatService.createConversation(req.user._id, dto);
  }

  @Get('conversations')
  async getConversations(@Req() req: any) {
    return this.chatService.getConversations(req.user._id);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') conversationId: string,
    @Req() req: any,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.chatService.getMessages(conversationId, req.user._id, page, limit);
  }

  @Get('support/conversations')
  async getSupportConversations() {
    return this.chatService.getSupportConversations();
  }
}
