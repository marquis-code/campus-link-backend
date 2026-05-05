import { Model, Types } from 'mongoose';
import { Referral, ReferralDocument } from '../../schemas/referral.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { ProductsService } from '../products/products.service';
export declare class ReferralsService {
    private referralModel;
    private productModel;
    private productsService;
    constructor(referralModel: Model<ReferralDocument>, productModel: Model<ProductDocument>, productsService: ProductsService);
    generate(promoterId: string, productId: string): Promise<(Referral & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findMyReferrals(promoterId: string): Promise<(Referral & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    trackClick(referralCode: string): Promise<{
        product: (Product & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
        referralCode: string;
        promoterId: Types.ObjectId;
    }>;
    findByProduct(productId: string): Promise<(Referral & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findByCode(referralCode: string): Promise<(Referral & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    incrementOrdersAndEarnings(referralId: string, commissionAmount: number): Promise<void>;
}
