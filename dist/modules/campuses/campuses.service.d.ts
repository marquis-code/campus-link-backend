import { Model } from 'mongoose';
import type { Cache } from 'cache-manager';
import { Campus, CampusDocument } from '../../schemas/campus.schema';
import { CreateCampusDto, UpdateCampusDto } from './dto/campus.dto';
export declare class CampusesService {
    private campusModel;
    private cacheManager;
    private readonly CACHE_KEY;
    private readonly CACHE_TTL;
    constructor(campusModel: Model<CampusDocument>, cacheManager: Cache);
    create(dto: CreateCampusDto): Promise<import("mongoose").Document<unknown, {}, CampusDocument, {}, import("mongoose").DefaultSchemaOptions> & Campus & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<any>;
    findAllAdmin(): Promise<(Campus & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<Campus & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: UpdateCampusDto): Promise<Campus & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    private invalidateCache;
}
