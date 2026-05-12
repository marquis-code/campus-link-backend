import { Model, Types } from 'mongoose';
import type { Cache } from 'cache-manager';
import { Earning, EarningDocument } from '../../schemas/earning.schema';
import { OrderDocument } from '../../schemas/order.schema';
import { WithdrawalDocument } from '../../schemas/withdrawal.schema';
import { WalletsService } from '../wallets/wallets.service';
export declare class EarningsService {
    private earningModel;
    private orderModel;
    private withdrawalModel;
    private walletsService;
    private cacheManager;
    constructor(earningModel: Model<EarningDocument>, orderModel: Model<OrderDocument>, withdrawalModel: Model<WithdrawalDocument>, walletsService: WalletsService, cacheManager: Cache);
    findMyEarnings(promoterId: string): Promise<(Earning & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getEarningsSummary(promoterId: string): Promise<any>;
    findAll(page?: number, limit?: number): Promise<{
        earnings: (Earning & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    getSellerEarningsSummary(sellerId: string): Promise<any>;
    markEarningsAsPaid(promoterId: string, amount: number): Promise<void>;
    invalidateSummaryCache(promoterId: string): Promise<void>;
}
