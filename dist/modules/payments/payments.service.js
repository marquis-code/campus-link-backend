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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("../../schemas/order.schema");
const withdrawal_schema_1 = require("../../schemas/withdrawal.schema");
const transaction_schema_1 = require("../../schemas/transaction.schema");
const notifications_service_1 = require("../notifications/notifications.service");
const mail_service_1 = require("../mail/mail.service");
const wallets_service_1 = require("../wallets/wallets.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    orderModel;
    withdrawalModel;
    notificationsService;
    mailService;
    walletsService;
    logger = new common_1.Logger(PaymentsService_1.name);
    constructor(orderModel, withdrawalModel, notificationsService, mailService, walletsService) {
        this.orderModel = orderModel;
        this.withdrawalModel = withdrawalModel;
        this.notificationsService = notificationsService;
        this.mailService = mailService;
        this.walletsService = walletsService;
    }
    async handleWebhook(event, data) {
        this.logger.log(`Handling Paystack Webhook: ${event}`);
        switch (event) {
            case 'charge.success':
                await this.handleChargeSuccess(data);
                break;
            case 'transfer.success':
                await this.handleTransferSuccess(data);
                break;
            case 'transfer.failed':
                await this.handleTransferFailed(data);
                break;
            case 'transfer.reversed':
                await this.handleTransferFailed(data);
                break;
            default:
                this.logger.warn(`Unhandled Paystack Event: ${event}`);
        }
    }
    async handleChargeSuccess(data) {
        const { reference, amount, customer } = data;
        if (reference && reference.startsWith('fund_')) {
            await this.walletsService.handleFundingWebhook({ data });
            return;
        }
        let order = await this.orderModel.findOne({ paymentReference: reference });
        if (!order) {
            order = await this.orderModel.findOne({
                buyerEmail: customer.email,
                totalPayable: amount / 100,
                status: order_schema_1.OrderStatus.PENDING,
            }).sort('-createdAt');
        }
        if (!order) {
            this.logger.error(`Order not found for charge.success reference: ${reference}`);
            return;
        }
        if (order.status !== order_schema_1.OrderStatus.PENDING) {
            this.logger.warn(`Order ${order._id} already processed. Status: ${order.status}`);
            return;
        }
        order.status = order_schema_1.OrderStatus.CONFIRMED;
        order.paidAt = new Date();
        await order.save();
        this.logger.log(`Order ${order._id} confirmed via Paystack charge.success`);
        const sellerRevenue = order.totalAmount - order.commissionAmount;
        await this.walletsService.creditWallet(order.seller.toString(), sellerRevenue, transaction_schema_1.TransactionPurpose.PURCHASE, `order_s_${order._id}`, `Revenue for Order #${order._id.toString().slice(-6).toUpperCase()}`, { orderId: order._id });
        if (order.promoter && order.commissionAmount > 0) {
            await this.walletsService.creditWallet(order.promoter.toString(), order.commissionAmount, transaction_schema_1.TransactionPurpose.EARNING, `order_a_${order._id}`, `Commission for Order #${order._id.toString().slice(-6).toUpperCase()}`, { orderId: order._id });
        }
        await this.notificationsService.notifyNewOrder(order.seller.toString(), '', order._id.toString(), order.totalAmount);
        await this.mailService.sendMail(order.buyerEmail, 'Payment Confirmed - Order Processing', `<h1>Payment Received!</h1><p>Your payment for <b>Order #${order._id.toString().slice(-6).toUpperCase()}</b> has been confirmed. The seller will contact you shortly for delivery.</p>`);
    }
    async handleTransferSuccess(data) {
        const { reference } = data;
        const withdrawal = await this.withdrawalModel.findOne({ transferReference: reference });
        if (withdrawal) {
            withdrawal.status = withdrawal_schema_1.WithdrawalStatus.COMPLETED;
            await withdrawal.save();
            this.logger.log(`Withdrawal ${withdrawal._id} marked as COMPLETED`);
            await this.notificationsService.create({
                user: withdrawal.user.toString(),
                title: 'Payout Successful! 💰',
                message: `Your withdrawal of ₦${withdrawal.amount.toLocaleString()} has been settled to your bank account.`,
                type: 'payment',
            });
        }
    }
    async handleTransferFailed(data) {
        const { reference } = data;
        const withdrawal = await this.withdrawalModel.findOne({ transferReference: reference });
        if (withdrawal) {
            withdrawal.status = withdrawal_schema_1.WithdrawalStatus.FAILED;
            await withdrawal.save();
            this.logger.error(`Withdrawal ${withdrawal._id} marked as FAILED`);
            await this.notificationsService.create({
                user: withdrawal.user.toString(),
                title: 'Payout Failed ❌',
                message: `Your withdrawal of ₦${withdrawal.amount.toLocaleString()} failed. The funds have been returned to your balance.`,
                type: 'payment',
            });
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(withdrawal_schema_1.Withdrawal.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationsService,
        mail_service_1.MailService,
        wallets_service_1.WalletsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map