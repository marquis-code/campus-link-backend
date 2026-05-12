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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const withdrawal_schema_1 = require("../../schemas/withdrawal.schema");
const user_schema_1 = require("../../schemas/user.schema");
const order_schema_1 = require("../../schemas/order.schema");
const notifications_service_1 = require("../notifications/notifications.service");
const earnings_service_1 = require("../earnings/earnings.service");
const paystack_service_1 = require("../../shared/services/paystack.service");
const wallets_service_1 = require("../wallets/wallets.service");
const transaction_schema_1 = require("../../schemas/transaction.schema");
let WithdrawalsService = class WithdrawalsService {
    withdrawalModel;
    userModel;
    orderModel;
    notificationsService;
    earningsService;
    paystackService;
    walletsService;
    constructor(withdrawalModel, userModel, orderModel, notificationsService, earningsService, paystackService, walletsService) {
        this.withdrawalModel = withdrawalModel;
        this.userModel = userModel;
        this.orderModel = orderModel;
        this.notificationsService = notificationsService;
        this.earningsService = earningsService;
        this.paystackService = paystackService;
        this.walletsService = walletsService;
    }
    async create(userId, dto) {
        const user = await this.userModel.findById(userId);
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const wallet = await this.walletsService.getOrCreateWallet(userId);
        if (wallet.balance < dto.amount) {
            throw new common_1.BadRequestException(`Insufficient balance. Available: ₦${wallet.balance.toLocaleString()}`);
        }
        const pendingWithdrawal = await this.withdrawalModel.findOne({
            user: new mongoose_2.Types.ObjectId(userId),
            status: withdrawal_schema_1.WithdrawalStatus.PENDING,
        });
        if (pendingWithdrawal) {
            throw new common_1.BadRequestException('You have a pending withdrawal request. Please wait for it to be processed.');
        }
        const withdrawal = await this.withdrawalModel.create({
            user: new mongoose_2.Types.ObjectId(userId),
            amount: dto.amount,
            bankName: dto.bankName || user?.bankName || '',
            bankAccountNumber: dto.bankAccountNumber || user?.bankAccountNumber || '',
            bankAccountName: dto.bankAccountName || user?.bankAccountName || '',
            bankCode: dto.bankCode || user?.bankCode || '',
        });
        await this.walletsService.debitWallet(userId, dto.amount, transaction_schema_1.TransactionPurpose.WITHDRAWAL, `wd_${withdrawal._id}`, `Withdrawal Request #${withdrawal._id.toString().slice(-6).toUpperCase()}`, { withdrawalId: withdrawal._id });
        return withdrawal;
    }
    async findMyWithdrawals(userId) {
        return this.withdrawalModel
            .find({ user: new mongoose_2.Types.ObjectId(userId) })
            .sort('-createdAt')
            .lean();
    }
    async findAll(page = 1, limit = 20, status) {
        const filter = {};
        if (status)
            filter.status = status;
        const skip = (page - 1) * limit;
        const [withdrawals, total] = await Promise.all([
            this.withdrawalModel
                .find(filter)
                .populate('user', 'name email phone')
                .populate('processedBy', 'name')
                .sort('-createdAt')
                .skip(skip)
                .limit(limit)
                .lean(),
            this.withdrawalModel.countDocuments(filter),
        ]);
        return { withdrawals, total, page, pages: Math.ceil(total / limit) };
    }
    async updateStatus(withdrawalId, dto, adminId) {
        const withdrawal = await this.withdrawalModel.findById(withdrawalId);
        if (!withdrawal)
            throw new common_1.NotFoundException('Withdrawal not found');
        withdrawal.status = dto.status;
        if (dto.adminNote)
            withdrawal.adminNote = dto.adminNote;
        withdrawal.processedBy = new mongoose_2.Types.ObjectId(adminId);
        withdrawal.processedAt = new Date();
        if (dto.status === 'approved') {
            try {
                const recipient = await this.paystackService.createTransferRecipient(withdrawal.bankAccountName, withdrawal.bankAccountNumber, withdrawal.bankCode);
                withdrawal.recipientCode = recipient.recipient_code;
                const transferRef = `wd_${withdrawal._id}_${Date.now()}`;
                const transfer = await this.paystackService.initiateTransfer(withdrawal.amount, recipient.recipient_code, transferRef, `CampusLink Payout: ${withdrawal.bankAccountName}`);
                withdrawal.transferReference = transferRef;
                withdrawal.status = withdrawal_schema_1.WithdrawalStatus.PROCESSING;
            }
            catch (err) {
                console.error('Paystack Transfer failed:', err.response?.data || err.message);
            }
        }
        await withdrawal.save();
        if (dto.status === 'approved' || dto.status === 'completed') {
            await this.earningsService.markEarningsAsPaid(withdrawal.user.toString(), withdrawal.amount);
        }
        else if (dto.status === 'rejected') {
            await this.walletsService.creditWallet(withdrawal.user.toString(), withdrawal.amount, transaction_schema_1.TransactionPurpose.REFUND, `wd_reject_${withdrawal._id}`, `Refund for Rejected Withdrawal #${withdrawal._id.toString().slice(-6).toUpperCase()}`, { withdrawalId: withdrawal._id });
        }
        const populatedWithdrawal = await withdrawal.populate('user', 'name email');
        const user = populatedWithdrawal.user;
        if (dto.status === 'approved' || dto.status === 'completed') {
            await this.notificationsService.notifyWithdrawalApproved(user._id.toString(), user.email, withdrawal.amount);
        }
        else if (dto.status === 'rejected') {
            await this.notificationsService.notifyWithdrawalRejected(user._id.toString(), user.email, withdrawal.amount, dto.adminNote || 'No reason provided');
        }
        return withdrawal;
    }
};
exports.WithdrawalsService = WithdrawalsService;
exports.WithdrawalsService = WithdrawalsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(withdrawal_schema_1.Withdrawal.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationsService,
        earnings_service_1.EarningsService,
        paystack_service_1.PaystackService,
        wallets_service_1.WalletsService])
], WithdrawalsService);
//# sourceMappingURL=withdrawals.service.js.map