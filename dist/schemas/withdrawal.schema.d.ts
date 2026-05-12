import { Document, Types } from 'mongoose';
export type WithdrawalDocument = Withdrawal & Document;
export declare enum WithdrawalStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    REVERSED = "reversed"
}
export declare class Withdrawal {
    user: Types.ObjectId;
    amount: number;
    bankName: string;
    bankAccountNumber: string;
    bankAccountName: string;
    bankCode: string;
    recipientCode: string;
    transferReference: string;
    status: WithdrawalStatus;
    adminNote: string;
    processedBy: Types.ObjectId;
    processedAt: Date;
}
export declare const WithdrawalSchema: import("mongoose").Schema<Withdrawal, import("mongoose").Model<Withdrawal, any, any, any, any, any, Withdrawal>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Withdrawal, Document<unknown, {}, Withdrawal, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Withdrawal & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    user?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Withdrawal, Document<unknown, {}, Withdrawal, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Withdrawal & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    amount?: import("mongoose").SchemaDefinitionProperty<number, Withdrawal, Document<unknown, {}, Withdrawal, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Withdrawal & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    bankName?: import("mongoose").SchemaDefinitionProperty<string, Withdrawal, Document<unknown, {}, Withdrawal, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Withdrawal & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    bankAccountNumber?: import("mongoose").SchemaDefinitionProperty<string, Withdrawal, Document<unknown, {}, Withdrawal, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Withdrawal & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    bankAccountName?: import("mongoose").SchemaDefinitionProperty<string, Withdrawal, Document<unknown, {}, Withdrawal, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Withdrawal & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    bankCode?: import("mongoose").SchemaDefinitionProperty<string, Withdrawal, Document<unknown, {}, Withdrawal, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Withdrawal & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    recipientCode?: import("mongoose").SchemaDefinitionProperty<string, Withdrawal, Document<unknown, {}, Withdrawal, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Withdrawal & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    transferReference?: import("mongoose").SchemaDefinitionProperty<string, Withdrawal, Document<unknown, {}, Withdrawal, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Withdrawal & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<WithdrawalStatus, Withdrawal, Document<unknown, {}, Withdrawal, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Withdrawal & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    adminNote?: import("mongoose").SchemaDefinitionProperty<string, Withdrawal, Document<unknown, {}, Withdrawal, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Withdrawal & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    processedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Withdrawal, Document<unknown, {}, Withdrawal, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Withdrawal & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    processedAt?: import("mongoose").SchemaDefinitionProperty<Date, Withdrawal, Document<unknown, {}, Withdrawal, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Withdrawal & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Withdrawal>;
