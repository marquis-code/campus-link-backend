import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, UpdateProductStatusDto, ProductQueryDto } from './dto/product.dto';
export declare class ProductsController {
    private productsService;
    constructor(productsService: ProductsService);
    findAll(query: ProductQueryDto): Promise<any>;
    findMine(userId: string, query: ProductQueryDto): Promise<{
        products: (import("../../schemas/product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    findAllAdmin(query: ProductQueryDto): Promise<{
        products: (import("../../schemas/product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<import("../../schemas/product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    create(userId: string, dto: CreateProductDto): Promise<(import("../../schemas/product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    update(id: string, userId: string, dto: UpdateProductDto): Promise<(import("../../schemas/product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updateStatus(id: string, dto: UpdateProductStatusDto): Promise<import("../../schemas/product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(user: any, id: string): Promise<{
        message: string;
    }>;
}
