import { Document } from 'mongoose';
export type CampusDocument = Campus & Document;
export declare class Campus {
    name: string;
    location: string;
    isActive: boolean;
}
export declare const CampusSchema: import("mongoose").Schema<Campus, import("mongoose").Model<Campus, any, any, any, any, any, Campus>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Campus, Document<unknown, {}, Campus, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Campus & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Campus, Document<unknown, {}, Campus, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Campus & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    location?: import("mongoose").SchemaDefinitionProperty<string, Campus, Document<unknown, {}, Campus, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Campus & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isActive?: import("mongoose").SchemaDefinitionProperty<boolean, Campus, Document<unknown, {}, Campus, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Campus & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Campus>;
