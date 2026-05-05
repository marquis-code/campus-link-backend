import { Document, Types } from 'mongoose';
export type MessageDocument = Message & Document;
export declare enum MessageType {
    TEXT = "text",
    IMAGE = "image",
    VIDEO = "video",
    VOICE = "voice",
    FILE = "file"
}
export declare class Message {
    conversation: Types.ObjectId;
    sender: Types.ObjectId;
    type: MessageType;
    content: string;
    mediaUrl?: string;
    mediaSize?: number;
    mediaDuration?: number;
    isRead: boolean;
    readBy: Types.ObjectId[];
}
export declare const MessageSchema: import("mongoose").Schema<Message, import("mongoose").Model<Message, any, any, any, any, any, Message>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Message, Document<unknown, {}, Message, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Message & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    conversation?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Message, Document<unknown, {}, Message, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Message & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    sender?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Message, Document<unknown, {}, Message, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Message & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<MessageType, Message, Document<unknown, {}, Message, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Message & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    content?: import("mongoose").SchemaDefinitionProperty<string, Message, Document<unknown, {}, Message, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Message & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mediaUrl?: import("mongoose").SchemaDefinitionProperty<string | undefined, Message, Document<unknown, {}, Message, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Message & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mediaSize?: import("mongoose").SchemaDefinitionProperty<number | undefined, Message, Document<unknown, {}, Message, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Message & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mediaDuration?: import("mongoose").SchemaDefinitionProperty<number | undefined, Message, Document<unknown, {}, Message, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Message & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isRead?: import("mongoose").SchemaDefinitionProperty<boolean, Message, Document<unknown, {}, Message, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Message & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    readBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId[], Message, Document<unknown, {}, Message, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Message & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Message>;
