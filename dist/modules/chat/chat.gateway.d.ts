import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    private jwtService;
    server: Server;
    private readonly logger;
    private userSockets;
    private socketUsers;
    constructor(chatService: ChatService, jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(data: {
        conversationId: string;
    }, client: Socket): {
        event: string;
        room: string;
    };
    handleLeaveRoom(data: {
        conversationId: string;
    }, client: Socket): {
        event: string;
        room: string;
    };
    handleMessage(client: Socket, dto: SendMessageDto): Promise<import("mongoose").PopulateDocumentResult<import("mongoose").Document<unknown, {}, import("../../schemas/message.schema").MessageDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/message.schema").Message & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }, {}, import("../../schemas/message.schema").MessageDocument, import("../../schemas/message.schema").MessageDocument> | undefined>;
    handleTyping(client: Socket, data: {
        conversationId: string;
        isTyping: boolean;
    }): void;
    handleMarkRead(client: Socket, data: {
        conversationId: string;
        messageId: string;
    }): Promise<void>;
    isUserOnline(userId: string): boolean;
}
