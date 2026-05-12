import { MessageType } from '../../../schemas/message.schema';
export declare class SendMessageDto {
    conversationId: string;
    type: MessageType;
    content?: string;
    mediaUrl?: string;
    mediaSize?: number;
    mediaDuration?: number;
}
export declare class CreateConversationDto {
    participantId?: string;
    subject?: string;
    isSupport?: boolean;
    guestInfo?: {
        name: string;
        email: string;
        phone: string;
    };
}
