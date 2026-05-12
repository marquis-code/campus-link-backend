import { Model, Types } from 'mongoose';
import { WalletDocument } from '../../schemas/wallet.schema';
import { Transaction, TransactionDocument, TransactionPurpose } from '../../schemas/transaction.schema';
import { PaystackService } from '../../shared/services/paystack.service';
export declare class WalletsService {
    private walletModel;
    private transactionModel;
    private paystackService;
    private readonly logger;
    constructor(walletModel: Model<WalletDocument>, transactionModel: Model<TransactionDocument>, paystackService: PaystackService);
    getOrCreateWallet(userId: string): Promise<WalletDocument>;
    getTransactions(userId: string, page?: number, limit?: number): Promise<{
        transactions: (Transaction & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    creditWallet(userId: string, amount: number, purpose: TransactionPurpose, reference: string, description: string, metadata?: any): Promise<WalletDocument>;
    debitWallet(userId: string, amount: number, purpose: TransactionPurpose, reference: string, description: string, metadata?: any): Promise<WalletDocument>;
    initializeFunding(userId: string, amount: number, email: string, callbackUrl?: string): Promise<{
        reference: any;
        amount: number;
        email: string;
        checkoutUrl: any;
    }>;
    handleFundingWebhook(payload: any): Promise<void>;
    syncEarnings(userId: string): Promise<{
        success: boolean;
        creditedCount: number;
        creditedAmount: number;
    }>;
}
