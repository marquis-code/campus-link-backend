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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const cache_manager_1 = require("@nestjs/cache-manager");
const category_schema_1 = require("../../schemas/category.schema");
let CategoriesService = class CategoriesService {
    categoryModel;
    cacheManager;
    CACHE_KEY = 'categories_all';
    CACHE_TTL = 3600000;
    constructor(categoryModel, cacheManager) {
        this.categoryModel = categoryModel;
        this.cacheManager = cacheManager;
    }
    async create(dto) {
        const category = await this.categoryModel.create(dto);
        await this.invalidateCache();
        return category;
    }
    async findAll() {
        const cached = await this.cacheManager.get(this.CACHE_KEY);
        if (cached)
            return cached;
        const categories = await this.categoryModel.find({ isActive: true }).sort({ name: 1 }).lean();
        await this.cacheManager.set(this.CACHE_KEY, categories, this.CACHE_TTL);
        return categories;
    }
    async findAllAdmin() {
        return this.categoryModel.find().sort({ name: 1 }).lean();
    }
    async findOne(id) {
        const category = await this.categoryModel.findById(id).lean();
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        return category;
    }
    async update(id, dto) {
        const category = await this.categoryModel
            .findByIdAndUpdate(id, { $set: dto }, { new: true })
            .lean();
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        await this.invalidateCache();
        return category;
    }
    async remove(id) {
        const category = await this.categoryModel.findByIdAndDelete(id);
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        await this.invalidateCache();
        return { message: 'Category deleted successfully' };
    }
    async invalidateCache() {
        await this.cacheManager.del(this.CACHE_KEY);
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [mongoose_2.Model, Object])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map