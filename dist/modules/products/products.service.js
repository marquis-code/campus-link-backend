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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const cache_manager_1 = require("@nestjs/cache-manager");
const common_2 = require("@nestjs/common");
const product_schema_1 = require("../../schemas/product.schema");
let ProductsService = class ProductsService {
    productModel;
    cacheManager;
    constructor(productModel, cacheManager) {
        this.productModel = productModel;
        this.cacheManager = cacheManager;
    }
    async create(sellerId, dto) {
        const product = await this.productModel.create({
            ...dto,
            seller: new mongoose_2.Types.ObjectId(sellerId),
            campus: new mongoose_2.Types.ObjectId(dto.campus),
            category: dto.category ? new mongoose_2.Types.ObjectId(dto.category) : undefined,
        });
        return this.productModel
            .findById(product._id)
            .populate('seller', 'name email phone')
            .populate('campus', 'name')
            .populate('category', 'name icon')
            .lean();
    }
    async findAll(query) {
        const cacheKey = `products_${JSON.stringify(query)}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const { campus, category, search, status = product_schema_1.ProductStatus.ACTIVE, page = 1, limit = 20, sort = '-createdAt', } = query;
        const filter = {};
        if (status)
            filter.status = status;
        if (campus)
            filter.campus = new mongoose_2.Types.ObjectId(campus);
        if (category)
            filter.category = new mongoose_2.Types.ObjectId(category);
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            this.productModel
                .find(filter)
                .populate('seller', 'name email avatar')
                .populate('campus', 'name')
                .populate('category', 'name icon')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            this.productModel.countDocuments(filter),
        ]);
        const result = {
            products,
            total,
            page,
            pages: Math.ceil(total / limit),
        };
        await this.cacheManager.set(cacheKey, result, 600000);
        return result;
    }
    async findOne(id) {
        const product = await this.productModel
            .findById(id)
            .populate('seller', 'name email phone avatar')
            .populate('campus', 'name location')
            .populate('category', 'name icon')
            .lean();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async findBySeller(sellerId, query) {
        const { page = 1, limit = 20, status } = query;
        const filter = { seller: new mongoose_2.Types.ObjectId(sellerId) };
        if (status)
            filter.status = status;
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            this.productModel
                .find(filter)
                .populate('campus', 'name')
                .populate('category', 'name icon')
                .sort('-createdAt')
                .skip(skip)
                .limit(limit)
                .lean(),
            this.productModel.countDocuments(filter),
        ]);
        return { products, total, page, pages: Math.ceil(total / limit) };
    }
    async update(id, sellerId, dto) {
        const product = await this.productModel.findById(id);
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.seller.toString() !== sellerId) {
            throw new common_1.ForbiddenException('You can only update your own products');
        }
        const updateData = { ...dto };
        if (dto.category)
            updateData.category = new mongoose_2.Types.ObjectId(dto.category);
        return this.productModel
            .findByIdAndUpdate(id, { $set: updateData }, { new: true })
            .populate('seller', 'name email')
            .populate('campus', 'name')
            .populate('category', 'name icon')
            .lean();
    }
    async updateStatus(id, dto) {
        const product = await this.productModel
            .findByIdAndUpdate(id, { $set: { status: dto.status } }, { new: true })
            .populate('seller', 'name email')
            .populate('campus', 'name')
            .lean();
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async remove(id, userId, isAdmin) {
        const product = await this.productModel.findById(id);
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (!isAdmin && product.seller.toString() !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own products');
        }
        await this.productModel.findByIdAndDelete(id);
        return { message: 'Product deleted successfully' };
    }
    async incrementSales(productId) {
        await this.productModel.findByIdAndUpdate(productId, {
            $inc: { totalSales: 1 },
        });
    }
    async incrementPromoters(productId) {
        await this.productModel.findByIdAndUpdate(productId, {
            $inc: { totalPromoters: 1 },
        });
    }
    async updateAiCopy(id, copy) {
        return this.productModel
            .findByIdAndUpdate(id, { $set: { aiGeneratedCopy: copy } }, { new: true })
            .lean();
    }
    async findAllAdmin(query) {
        const { page = 1, limit = 20, status, search } = query;
        const filter = {};
        if (status)
            filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            this.productModel
                .find(filter)
                .populate('seller', 'name email')
                .populate('campus', 'name')
                .populate('category', 'name icon')
                .sort('-createdAt')
                .skip(skip)
                .limit(limit)
                .lean(),
            this.productModel.countDocuments(filter),
        ]);
        return { products, total, page, pages: Math.ceil(total / limit) };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(1, (0, common_2.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [mongoose_2.Model, Object])
], ProductsService);
//# sourceMappingURL=products.service.js.map