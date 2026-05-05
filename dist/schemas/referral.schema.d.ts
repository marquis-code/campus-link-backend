import { Document, Types } from 'mongoose';
export type ReferralDocument = Referral & Document;
export declare class Referral {
    product: Types.ObjectId;
    promoter: Types.ObjectId;
    referralCode: string;
    clicks: number;
    orders: number;
    earnings: number;
}
export declare const ReferralSchema: import("mongoose").Schema<Referral, import("mongoose").Model<Referral, any, any, any, any, any, Referral>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Referral, Document<unknown, {}, Referral, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Referral & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    product?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Referral, Document<unknown, {}, Referral, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Referral & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    promoter?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Referral, Document<unknown, {}, Referral, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Referral & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    referralCode?: import("mongoose").SchemaDefinitionProperty<string, Referral, Document<unknown, {}, Referral, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Referral & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    clicks?: import("mongoose").SchemaDefinitionProperty<number, Referral, Document<unknown, {}, Referral, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Referral & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    orders?: import("mongoose").SchemaDefinitionProperty<number, Referral, Document<unknown, {}, Referral, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Referral & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    earnings?: import("mongoose").SchemaDefinitionProperty<number, Referral, Document<unknown, {}, Referral, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Referral & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Referral>;
