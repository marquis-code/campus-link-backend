import { ProductStatus } from '../../../schemas/product.schema';
export declare class CreateProductDto {
    name: string;
    description: string;
    price: number;
    commissionAmount: number;
    campus: string;
    category?: string;
    images?: string[];
    sellerWhatsapp?: string;
    sellerPhone?: string;
}
export declare class UpdateProductDto {
    name?: string;
    description?: string;
    price?: number;
    commissionAmount?: number;
    category?: string;
    images?: string[];
    sellerWhatsapp?: string;
    sellerPhone?: string;
}
export declare class UpdateProductStatusDto {
    status: ProductStatus;
}
export declare class ProductQueryDto {
    campus?: string;
    category?: string;
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
    sort?: string;
}
