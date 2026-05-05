import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    server: Server;
    constructor(chatService: ChatService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(conversationId: string, client: Socket): {
        event: string;
        room: string;
    };
    handleLeaveRoom(conversationId: string, client: Socket): {
        event: string;
        room: string;
    };
    handleMessage(client: any, dto: SendMessageDto): Promise<import("mongoose").PopulateDocumentResult<import("mongoose").Document<unknown, {}, import("../../schemas/message.schema").MessageDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/message.schema").Message & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, import("../../schemas/message.schema").MessageDocument, import("../../schemas/message.schema").MessageDocument>>;
    handleTyping(client: any, data: {
        conversationId: string;
        isTyping: boolean;
    }): void;
}
