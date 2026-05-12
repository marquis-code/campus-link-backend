import { AdminService } from './admin.service';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
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
    getUsers(role: string, page: number, limit: number, search: string): Promise<{
        users: (import("../../schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    updateUserStatus(id: string, isActive: boolean): Promise<(import("../../schemas/user.schema").User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    getRecentOrders(limit: number): Promise<(import("../../schemas/order.schema").Order & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getTopPromoters(limit: number): Promise<any[]>;
    getTopProducts(limit: number): Promise<(import("../../schemas/product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getAllTransactions(page?: number, limit?: number): Promise<{
        transactions: (import("../../schemas/transaction.schema").Transaction & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    getAllWallets(page?: number, limit?: number): Promise<{
        wallets: (import("../../schemas/wallet.schema").Wallet & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
}
