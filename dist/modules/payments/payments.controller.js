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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const paystack_service_1 = require("../../shared/services/paystack.service");
let PaymentsController = class PaymentsController {
    paymentsService;
    paystackService;
    constructor(paymentsService, paystackService) {
        this.paymentsService = paymentsService;
        this.paystackService = paystackService;
    }
    async handleWebhook(signature, payload) {
        if (!signature) {
            throw new common_1.BadRequestException('Missing Paystack signature');
        }
        const isValid = this.paystackService.verifySignature(signature, payload);
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid Paystack signature');
        }
        await this.paymentsService.handleWebhook(payload.event, payload.data);
        return { status: 'success' };
    }
    async getBanks() {
        return this.paystackService.getBanks();
    }
    async resolveAccount(accountNumber, bankCode) {
        return this.paystackService.resolveAccountNumber(accountNumber, bankCode);
    }
    async verifyPayment(reference) {
        const data = await this.paystackService.verifyTransaction(reference);
        if (data.status === 'success') {
            await this.paymentsService.handleWebhook('charge.success', data);
        }
        return data;
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Headers)('x-paystack-signature')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('banks'),
    (0, common_1.HttpCode)(200),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getBanks", null);
__decorate([
    (0, common_1.Get)('resolve-account'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Query)('accountNumber')),
    __param(1, (0, common_1.Query)('bankCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "resolveAccount", null);
__decorate([
    (0, common_1.Get)('verify-payment/:reference'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyPayment", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        paystack_service_1.PaystackService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map