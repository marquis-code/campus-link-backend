import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { EarningDocument } from '../../schemas/earning.schema';
import { ReferralDocument } from '../../schemas/referral.schema';
import { WithdrawalDocument } from '../../schemas/withdrawal.schema';
export declare class AdminService {
    private userModel;
    private productModel;
    private orderModel;
    private earningModel;
    private referralModel;
    private withdrawalModel;
    constructor(userModel: Model<UserDocument>, productModel: Model<ProductDocument>, orderModel: Model<OrderDocument>, earningModel: Model<EarningDocument>, referralModel: Model<ReferralDocument>, withdrawalModel: Model<WithdrawalDocument>);
    getStats(): Promise<{
        users: {
            total: number;
            students: number;
            sellers: number;
        };
        products: {
            total: number;
            active: number;
            pending: number;
        };
        orders: {
            total: number;
            confirmed: number;
            pending: number;
        };
        referrals: {
            total: number;
        };
        withdrawals: {
            pending: number;
        };
        revenue: {
            totalSales: any;
            totalEarnings: any;
            totalWithdrawn: any;
        };
    }>;
    getUsers(query: {
        role?: string;
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{
        users: (User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    updateUserStatus(userId: string, isActive: boolean): Promise<(User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    getRecentOrders(limit?: number): Promise<(Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getTopPromoters(limit?: number): Promise<any[]>;
    getTopProducts(limit?: number): Promise<(Product & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
