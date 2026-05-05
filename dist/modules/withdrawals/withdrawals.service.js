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
const notification_schema_1 = require("../../schemas/notification.schema");
const earnings_service_1 = require("../earnings/earnings.service");
let WithdrawalsService = class WithdrawalsService {
    withdrawalModel;
    userModel;
    notificationModel;
    earningsService;
    constructor(withdrawalModel, userModel, notificationModel, earningsService) {
        this.withdrawalModel = withdrawalModel;
        this.userModel = userModel;
        this.notificationModel = notificationModel;
        this.earningsService = earningsService;
    }
    async create(userId, dto) {
        const summary = await this.earningsService.getEarningsSummary(userId);
        if (summary.availableEarnings < dto.amount) {
            throw new common_1.BadRequestException(`Insufficient balance. Available: ₦${summary.availableEarnings}`);
        }
        const pendingWithdrawal = await this.withdrawalModel.findOne({
            user: new mongoose_2.Types.ObjectId(userId),
            status: withdrawal_schema_1.WithdrawalStatus.PENDING,
        });
        if (pendingWithdrawal) {
            throw new common_1.BadRequestException('You have a pending withdrawal request. Please wait for it to be processed.');
        }
        const user = await this.userModel.findById(userId);
        const withdrawal = await this.withdrawalModel.create({
            user: new mongoose_2.Types.ObjectId(userId),
            amount: dto.amount,
            bankName: dto.bankName || user?.bankName || '',
            bankAccountNumber: dto.bankAccountNumber || user?.bankAccountNumber || '',
            bankAccountName: dto.bankAccountName || user?.bankAccountName || '',
        });
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
        await withdrawal.save();
        if (dto.status === 'approved' || dto.status === 'completed') {
            await this.earningsService.markEarningsAsPaid(withdrawal.user.toString(), withdrawal.amount);
        }
        const statusMessages = {
            approved: 'Your withdrawal request has been approved! 🎉',
            rejected: `Your withdrawal request was rejected. ${dto.adminNote || ''}`,
            processing: 'Your withdrawal is being processed.',
            completed: 'Your withdrawal has been completed! Check your bank account.',
        };
        await this.notificationModel.create({
            user: withdrawal.user,
            title: 'Withdrawal Update',
            message: statusMessages[dto.status] || 'Withdrawal status updated',
            type: notification_schema_1.NotificationType.WITHDRAWAL,
            meta: { withdrawalId: withdrawal._id, status: dto.status },
        });
        return withdrawal;
    }
};
exports.WithdrawalsService = WithdrawalsService;
exports.WithdrawalsService = WithdrawalsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(withdrawal_schema_1.Withdrawal.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        earnings_service_1.EarningsService])
], WithdrawalsService);
//# sourceMappingURL=withdrawals.service.js.map