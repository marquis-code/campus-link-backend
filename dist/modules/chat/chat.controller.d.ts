import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/chat.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    createConversation(req: any, dto: CreateConversationDto): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/conversation.schema").ConversationDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/conversation.schema").Conversation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getConversations(req: any): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/conversation.schema").ConversationDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/conversation.schema").Conversation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getMessages(conversationId: string, req: any, page: number, limit: number): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/message.schema").MessageDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/message.schema").Message & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getSupportConversations(): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/conversation.schema").ConversationDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/conversation.schema").Conversation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
