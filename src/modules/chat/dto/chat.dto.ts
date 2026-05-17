import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { MessageType } from '../../../schemas/message.schema';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsEnum(MessageType)
  type: MessageType;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @IsNumber()
  @IsOptional()
  mediaSize?: number;

  @IsNumber()
  @IsOptional()
  mediaDuration?: number;
}

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  participantId?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  isSupport?: boolean;

  @IsOptional()
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}
