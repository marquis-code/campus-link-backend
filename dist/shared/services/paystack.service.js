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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PaystackService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaystackService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let PaystackService = PaystackService_1 = class PaystackService {
    configService;
    logger = new common_1.Logger(PaystackService_1.name);
    baseUrl = 'https://api.paystack.co';
    constructor(configService) {
        this.configService = configService;
    }
    get headers() {
        return {
            Authorization: `Bearer ${this.configService.get('PAYSTACK_SECRET_KEY')}`,
            'Content-Type': 'application/json',
        };
    }
    async createCustomer(email, firstName, lastName, phone) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/customer`, { email, first_name: firstName, last_name: lastName, phone }, { headers: this.headers });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create Paystack customer', error.response?.data || error.message);
            throw error;
        }
    }
    async createVirtualAccount(customerCode) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/dedicated_account`, { customer: customerCode, preferred_bank: 'wema-bank' }, { headers: this.headers });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create Virtual Account', error.response?.data || error.message);
            throw error;
        }
    }
    async initializeTransaction(email, amount, reference, callbackUrl) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/transaction/initialize`, {
                email,
                amount: Math.round(amount * 100),
                reference,
                callback_url: callbackUrl,
            }, { headers: this.headers });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to initialize Paystack transaction', error.response?.data || error.message);
            throw error;
        }
    }
    async verifyTransaction(reference) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/transaction/verify/${reference}`, { headers: this.headers });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to verify Paystack transaction', error.response?.data || error.message);
            throw error;
        }
    }
    async createTransferRecipient(name, accountNumber, bankCode) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/transferrecipient`, {
                type: 'nuban',
                name,
                account_number: accountNumber,
                bank_code: bankCode,
                currency: 'NGN',
            }, { headers: this.headers });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to create Transfer Recipient', error.response?.data || error.message);
            throw error;
        }
    }
    async initiateTransfer(amount, recipientCode, reference, reason) {
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/transfer`, {
                source: 'balance',
                amount: Math.round(amount * 100),
                recipient: recipientCode,
                reference,
                reason: reason || 'CampusLink Payout',
            }, { headers: this.headers });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to initiate transfer', error.response?.data || error.message);
            throw error;
        }
    }
    async getBanks() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/bank`, {
                headers: this.headers,
            });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to fetch banks', error.message);
            throw error;
        }
    }
    async resolveAccountNumber(accountNumber, bankCode) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, { headers: this.headers });
            return response.data.data;
        }
        catch (error) {
            this.logger.error('Failed to resolve account number', error.response?.data || error.message);
            throw error;
        }
    }
    verifySignature(signature, payload) {
        const crypto = require('crypto');
        const secret = this.configService.get('PAYSTACK_SECRET_KEY');
        const hash = crypto
            .createHmac('sha512', secret)
            .update(JSON.stringify(payload))
            .digest('hex');
        return hash === signature;
    }
};
exports.PaystackService = PaystackService;
exports.PaystackService = PaystackService = PaystackService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaystackService);
//# sourceMappingURL=paystack.service.js.map