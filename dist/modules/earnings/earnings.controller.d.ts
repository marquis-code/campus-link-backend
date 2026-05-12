import { EarningsService } from './earnings.service';
export declare class EarningsController {
    private earningsService;
    constructor(earningsService: EarningsService);
    findMine(userId: string): Promise<(import("../../schemas/earning.schema").Earning & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getSummary(userId: string, role: string): Promise<any>;
    findAll(page: number, limit: number): Promise<{
        earnings: (import("../../schemas/earning.schema").Earning & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
}
