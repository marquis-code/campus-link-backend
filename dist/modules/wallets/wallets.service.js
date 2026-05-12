"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WalletsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const wallet_schema_1 = require("../../schemas/wallet.schema");
const transaction_schema_1 = require("../../schemas/transaction.schema");
const paystack_service_1 = require("../../shared/services/paystack.service");
let WalletsService = WalletsService_1 = class WalletsService {
    walletModel;
    transactionModel;
    paystackService;
    logger = new common_1.Logger(WalletsService_1.name);
    constructor(walletModel, transactionModel, paystackService) {
        this.walletModel = walletModel;
        this.transactionModel = transactionModel;
        this.paystackService = paystackService;
    }
    async getOrCreateWallet(userId) {
        let wallet = await this.walletModel.findOne({ user: new mongoose_2.Types.ObjectId(userId) });
        if (!wallet) {
            wallet = await this.walletModel.create({ user: new mongoose_2.Types.ObjectId(userId), balance: 0 });
        }
        return wallet;
    }
    async getTransactions(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [transactions, total] = await Promise.all([
            this.transactionModel
                .find({ user: new mongoose_2.Types.ObjectId(userId) })
                .sort('-createdAt')
                .skip(skip)
                .limit(limit)
                .lean(),
            this.transactionModel.countDocuments({ user: new mongoose_2.Types.ObjectId(userId) }),
        ]);
        return { transactions, total, page, pages: Math.ceil(total / limit) };
    }
    async creditWallet(userId, amount, purpose, reference, description, metadata) {
        const wallet = await this.getOrCreateWallet(userId);
        const existing = await this.transactionModel.findOne({ reference });
        if (existing && existing.status === transaction_schema_1.TransactionStatus.SUCCESS) {
            return wallet;
        }
        const session = await this.walletModel.db.startSession();
        session.startTransaction();
        try {
            let transaction = await this.transactionModel.findOne({ reference });
            if (transaction) {
                if (transaction.status === transaction_schema_1.TransactionStatus.SUCCESS) {
                    await session.abortTransaction();
                    return wallet;
                }
                transaction.status = transaction_schema_1.TransactionStatus.SUCCESS;
                transaction.amount = amount;
                transaction.description = description;
                transaction.metadata = { ...transaction.metadata, ...metadata };
                await transaction.save({ session });
            }
            else {
                await this.transactionModel.create([{
                        user: new mongoose_2.Types.ObjectId(userId),
                        wallet: wallet._id,
                        amount,
                        type: transaction_schema_1.TransactionType.CREDIT,
                        purpose,
                        status: transaction_schema_1.TransactionStatus.SUCCESS,
                        reference,
                        description,
                        metadata,
                    }], { session });
            }
            wallet.balance += amount;
            await wallet.save({ session });
            await session.commitTransaction();
            return wallet;
        }
        catch (error) {
            await session.abortTransaction();
            this.logger.error(`Failed to credit wallet for user ${userId}`, error.stack);
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async debitWallet(userId, amount, purpose, reference, description, metadata) {
        const wallet = await this.getOrCreateWallet(userId);
        if (wallet.balance < amount) {
            throw new common_1.BadRequestException('Insufficient wallet balance');
        }
        const session = await this.walletModel.db.startSession();
        session.startTransaction();
        try {
            await this.transactionModel.create([{
                    user: new mongoose_2.Types.ObjectId(userId),
                    wallet: wallet._id,
                    amount,
                    type: transaction_schema_1.TransactionType.DEBIT,
                    purpose,
                    status: transaction_schema_1.TransactionStatus.SUCCESS,
                    reference,
                    description,
                    metadata,
                }], { session });
            wallet.balance -= amount;
            await wallet.save({ session });
            await session.commitTransaction();
            return wallet;
        }
        catch (error) {
            await session.abortTransaction();
            this.logger.error(`Failed to debit wallet for user ${userId}`, error.stack);
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async initializeFunding(userId, amount, email, callbackUrl) {
        const reference = `fund_${userId}_${Date.now()}`;
        const wallet = await this.getOrCreateWallet(userId);
        const payment = await this.paystackService.initializeTransaction(email, amount, reference, callbackUrl);
        await this.transactionModel.create({
            user: new mongoose_2.Types.ObjectId(userId),
            wallet: wallet._id,
            amount,
            type: transaction_schema_1.TransactionType.CREDIT,
            purpose: transaction_schema_1.TransactionPurpose.FUNDING,
            status: transaction_schema_1.TransactionStatus.PENDING,
            reference: payment.reference,
            description: 'Wallet funding initialization',
            metadata: { callbackUrl }
        });
        return {
            reference: payment.reference,
            amount,
            email,
            checkoutUrl: payment.authorization_url
        };
    }
    async handleFundingWebhook(payload) {
        const { reference, amount, customer } = payload.data;
        const transaction = await this.transactionModel.findOne({ reference });
        if (!transaction || transaction.status !== transaction_schema_1.TransactionStatus.PENDING) {
            this.logger.warn(`Funding transaction not found or already processed: ${reference}`);
            return;
        }
        await this.creditWallet(transaction.user.toString(), amount / 100, transaction_schema_1.TransactionPurpose.FUNDING, reference, 'Wallet funding confirmed');
    }
    async syncEarnings(userId) {
        const userObjId = new mongoose_2.Types.ObjectId(userId);
        let creditedCount = 0;
        let creditedAmount = 0;
        const OrderModel = this.walletModel.db.model('Order');
        const confirmedOrders = await OrderModel.find({
            seller: userObjId,
            status: 'confirmed'
        });
        for (const order of confirmedOrders) {
            const reference = `settle_${order._id}`;
            const amountToCredit = order.totalAmount - order.commissionAmount;
            const existing = await this.transactionModel.findOne({ reference });
            if (!existing) {
                await this.creditWallet(userId, amountToCredit, transaction_schema_1.TransactionPurpose.ORDER_SETTLEMENT, reference, `Sync: Settlement for order #${order._id.toString().slice(-6).toUpperCase()}`);
                creditedCount++;
                creditedAmount += amountToCredit;
            }
        }
        const EarningModel = this.walletModel.db.model('Earning');
        const availableEarnings = await EarningModel.find({
            promoter: userObjId,
            status: 'available'
        });
        for (const earning of availableEarnings) {
            const reference = `order_a_${earning.order}`;
            const existing = await this.transactionModel.findOne({ reference });
            if (!existing) {
                await this.creditWallet(userId, earning.amount, transaction_schema_1.TransactionPurpose.EARNING, reference, `Sync: Commission for order #${earning.order.toString().slice(-6).toUpperCase()}`);
                creditedCount++;
                creditedAmount += earning.amount;
            }
        }
        return { success: true, creditedCount, creditedAmount };
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = WalletsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(wallet_schema_1.Wallet.name)),
    __param(1, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        paystack_service_1.PaystackService])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map