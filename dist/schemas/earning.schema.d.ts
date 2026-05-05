import { Document, Types } from 'mongoose';
export type EarningDocument = Earning & Document;
export declare enum EarningStatus {
    PENDING = "pending",
    AVAILABLE = "available",
    PAID = "paid"
}
export declare class Earning {
    promoter: Types.ObjectId;
    order: Types.ObjectId;
    product: Types.ObjectId;
    amount: number;
    status: EarningStatus;
}
export declare const EarningSchema: import("mongoose").Schema<Earning, import("mongoose").Model<Earning, any, any, any, any, any, Earning>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Earning, Document<unknown, {}, Earning, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Earning & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    promoter?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Earning, Document<unknown, {}, Earning, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Earning & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    order?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Earning, Document<unknown, {}, Earning, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Earning & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    product?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Earning, Document<unknown, {}, Earning, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Earning & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    amount?: import("mongoose").SchemaDefinitionProperty<number, Earning, Document<unknown, {}, Earning, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Earning & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<EarningStatus, Earning, Document<unknown, {}, Earning, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Earning & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Earning>;
