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
exports.EarningsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const cache_manager_1 = require("@nestjs/cache-manager");
const earning_schema_1 = require("../../schemas/earning.schema");
let EarningsService = class EarningsService {
    earningModel;
    cacheManager;
    constructor(earningModel, cacheManager) {
        this.earningModel = earningModel;
        this.cacheManager = cacheManager;
    }
    async findMyEarnings(promoterId) {
        return this.earningModel
            .find({ promoter: new mongoose_2.Types.ObjectId(promoterId) })
            .populate('product', 'name price images')
            .populate('order', 'buyerName status totalAmount createdAt')
            .sort('-createdAt')
            .lean();
    }
    async getEarningsSummary(promoterId) {
        const cacheKey = `earnings_summary_${promoterId}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const promoterObjId = new mongoose_2.Types.ObjectId(promoterId);
        const [totalResult, pendingResult, availableResult, paidResult] = await Promise.all([
            this.earningModel.aggregate([
                { $match: { promoter: promoterObjId } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            this.earningModel.aggregate([
                { $match: { promoter: promoterObjId, status: 'pending' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            this.earningModel.aggregate([
                { $match: { promoter: promoterObjId, status: 'available' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            this.earningModel.aggregate([
                { $match: { promoter: promoterObjId, status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
        ]);
        const totalEarnings = totalResult[0]?.total || 0;
        const pendingEarnings = pendingResult[0]?.total || 0;
        const availableEarnings = availableResult[0]?.total || 0;
        const paidEarnings = paidResult[0]?.total || 0;
        const totalSales = await this.earningModel.countDocuments({
            promoter: promoterObjId,
        });
        const summary = {
            totalEarnings,
            pendingEarnings,
            availableEarnings,
            paidEarnings,
            totalSales,
        };
        await this.cacheManager.set(cacheKey, summary, 120000);
        return summary;
    }
    async findAll(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [earnings, total] = await Promise.all([
            this.earningModel
                .find()
                .populate('promoter', 'name email')
                .populate('product', 'name price')
                .populate('order', 'buyerName status totalAmount')
                .sort('-createdAt')
                .skip(skip)
                .limit(limit)
                .lean(),
            this.earningModel.countDocuments(),
        ]);
        return { earnings, total, page, pages: Math.ceil(total / limit) };
    }
    async markEarningsAsPaid(promoterId, amount) {
        const earnings = await this.earningModel
            .find({
            promoter: new mongoose_2.Types.ObjectId(promoterId),
            status: 'available',
        })
            .sort('createdAt');
        let remaining = amount;
        for (const earning of earnings) {
            if (remaining <= 0)
                break;
            earning.status = 'paid';
            await earning.save();
            remaining -= earning.amount;
        }
        await this.invalidateSummaryCache(promoterId);
    }
    async invalidateSummaryCache(promoterId) {
        await this.cacheManager.del(`earnings_summary_${promoterId}`);
    }
};
exports.EarningsService = EarningsService;
exports.EarningsService = EarningsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(earning_schema_1.Earning.name)),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [mongoose_2.Model, Object])
], EarningsService);
//# sourceMappingURL=earnings.service.js.map