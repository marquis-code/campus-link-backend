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
exports.ReferralsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const nanoid_1 = require("nanoid");
const referral_schema_1 = require("../../schemas/referral.schema");
const product_schema_1 = require("../../schemas/product.schema");
const products_service_1 = require("../products/products.service");
let ReferralsService = class ReferralsService {
    referralModel;
    productModel;
    productsService;
    constructor(referralModel, productModel, productsService) {
        this.referralModel = referralModel;
        this.productModel = productModel;
        this.productsService = productsService;
    }
    async generate(promoterId, productId) {
        const product = await this.productModel.findById(productId);
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.status !== 'active') {
            throw new common_1.BadRequestException('Product is not active');
        }
        if (product.seller.toString() === promoterId) {
            throw new common_1.BadRequestException('You cannot promote your own product');
        }
        const existing = await this.referralModel.findOne({
            product: new mongoose_2.Types.ObjectId(productId),
            promoter: new mongoose_2.Types.ObjectId(promoterId),
        });
        if (existing) {
            return this.referralModel
                .findById(existing._id)
                .populate('product', 'name price commissionAmount images')
                .populate('promoter', 'name email')
                .lean();
        }
        const referralCode = (0, nanoid_1.nanoid)(8);
        const referral = await this.referralModel.create({
            product: new mongoose_2.Types.ObjectId(productId),
            promoter: new mongoose_2.Types.ObjectId(promoterId),
            referralCode,
        });
        await this.productsService.incrementPromoters(productId);
        return this.referralModel
            .findById(referral._id)
            .populate('product', 'name price commissionAmount images')
            .populate('promoter', 'name email')
            .lean();
    }
    async findMyReferrals(promoterId) {
        return this.referralModel
            .find({ promoter: new mongoose_2.Types.ObjectId(promoterId) })
            .populate('product', 'name price commissionAmount images status')
            .sort('-createdAt')
            .lean();
    }
    async trackClick(referralCode) {
        const referral = await this.referralModel.findOne({ referralCode });
        if (!referral)
            throw new common_1.NotFoundException('Referral not found');
        await this.referralModel.findByIdAndUpdate(referral._id, {
            $inc: { clicks: 1 },
        });
        const product = await this.productModel
            .findById(referral.product)
            .populate('seller', 'name phone')
            .populate('campus', 'name')
            .lean();
        return {
            product,
            referralCode,
            promoterId: referral.promoter,
        };
    }
    async findByProduct(productId) {
        return this.referralModel
            .find({ product: new mongoose_2.Types.ObjectId(productId) })
            .populate('promoter', 'name email avatar')
            .sort('-earnings')
            .lean();
    }
    async findByCode(referralCode) {
        return this.referralModel
            .findOne({ referralCode })
            .populate('product')
            .populate('promoter', 'name email')
            .lean();
    }
    async incrementOrdersAndEarnings(referralId, commissionAmount) {
        await this.referralModel.findByIdAndUpdate(referralId, {
            $inc: { orders: 1, earnings: commissionAmount },
        });
    }
};
exports.ReferralsService = ReferralsService;
exports.ReferralsService = ReferralsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(referral_schema_1.Referral.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        products_service_1.ProductsService])
], ReferralsService);
//# sourceMappingURL=referrals.service.js.map