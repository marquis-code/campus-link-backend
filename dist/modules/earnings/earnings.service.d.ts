import { Model, Types } from 'mongoose';
import type { Cache } from 'cache-manager';
import { Earning, EarningDocument } from '../../schemas/earning.schema';
export declare class EarningsService {
    private earningModel;
    private cacheManager;
    constructor(earningModel: Model<EarningDocument>, cacheManager: Cache);
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
    markEarningsAsPaid(promoterId: string, amount: number): Promise<void>;
    invalidateSummaryCache(promoterId: string): Promise<void>;
}
