import { Model } from 'mongoose';
import type { Cache } from 'cache-manager';
import { Category, CategoryDocument } from '../../schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
export declare class CategoriesService {
    private categoryModel;
    private cacheManager;
    private readonly CACHE_KEY;
    private readonly CACHE_TTL;
    constructor(categoryModel: Model<CategoryDocument>, cacheManager: Cache);
    create(dto: CreateCategoryDto): Promise<import("mongoose").Document<unknown, {}, CategoryDocument, {}, import("mongoose").DefaultSchemaOptions> & Category & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(): Promise<any>;
    findAllAdmin(): Promise<(Category & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<Category & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, dto: UpdateCategoryDto): Promise<Category & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    private invalidateCache;
}
