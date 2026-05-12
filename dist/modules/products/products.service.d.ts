import { Model, Types } from 'mongoose';
import type { Cache } from 'cache-manager';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { CreateProductDto, UpdateProductDto, UpdateProductStatusDto, ProductQueryDto } from './dto/product.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ProductsService {
    private productModel;
    private cacheManager;
    private notificationsService;
    constructor(productModel: Model<ProductDocument>, cacheManager: Cache, notificationsService: NotificationsService);
    create(sellerId: string, dto: CreateProductDto): Promise<(Product & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findAll(query: ProductQueryDto): Promise<any>;
    findOne(id: string): Promise<Product & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findBySeller(sellerId: string, query: ProductQueryDto): Promise<{
        products: (Product & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    update(id: string, sellerId: string, dto: UpdateProductDto): Promise<(Product & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updateStatus(id: string, dto: UpdateProductStatusDto): Promise<Product & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(id: string, userId: string, isAdmin: boolean): Promise<{
        message: string;
    }>;
    incrementSales(productId: string): Promise<void>;
    incrementPromoters(productId: string): Promise<void>;
    decrementPromoters(productId: string): Promise<void>;
    updateAiCopy(id: string, copy: string): Promise<(Product & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findAllAdmin(query: ProductQueryDto): Promise<{
        products: (Product & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
}
