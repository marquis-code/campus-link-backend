import { WalletsService } from './wallets.service';
export declare class WalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    getMyWallet(userId: string): Promise<import("../../schemas/wallet.schema").WalletDocument>;
    getMyTransactions(userId: string, page?: number, limit?: number): Promise<{
        transactions: (import("../../schemas/transaction.schema").Transaction & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    initializeFunding(userId: string, email: string, body: {
        amount: number;
        callbackUrl?: string;
    }): Promise<{
        reference: any;
        amount: number;
        email: string;
        checkoutUrl: any;
    }>;
    syncEarnings(userId: string): Promise<{
        success: boolean;
        creditedCount: number;
        creditedAmount: number;
    }>;
}
