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
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const campus_schema_1 = require("../../schemas/campus.schema");
const category_schema_1 = require("../../schemas/category.schema");
let SeedService = class SeedService {
    campusModel;
    categoryModel;
    constructor(campusModel, categoryModel) {
        this.campusModel = campusModel;
        this.categoryModel = categoryModel;
    }
    async seed() {
        const campusesCount = await this.campusModel.countDocuments();
        if (campusesCount === 0) {
            const campuses = [
                { name: 'University of Lagos', address: 'Akoka, Yaba', isActive: true },
                {
                    name: 'University of Ibadan',
                    address: 'Ibadan, Oyo State',
                    isActive: true,
                },
                {
                    name: 'Obafemi Awolowo University',
                    address: 'Ile-Ife, Osun State',
                    isActive: true,
                },
                {
                    name: 'Covenant University',
                    address: 'Ota, Ogun State',
                    isActive: true,
                },
                {
                    name: 'University of Nigeria, Nsukka',
                    address: 'Nsukka, Enugu State',
                    isActive: true,
                },
                {
                    name: 'Lagos State University',
                    address: 'Ojo, Lagos',
                    isActive: true,
                },
                {
                    name: 'Ahmadu Bello University',
                    address: 'Zaria, Kaduna State',
                    isActive: true,
                },
                {
                    name: 'University of Benin',
                    address: 'Benin City, Edo State',
                    isActive: true,
                },
                {
                    name: 'Federal University of Technology, Akure',
                    address: 'Akure, Ondo State',
                    isActive: true,
                },
                {
                    name: 'Babcock University',
                    address: 'Ilishan-Remo, Ogun State',
                    isActive: true,
                },
            ];
            await this.campusModel.insertMany(campuses);
            console.log('✅ Campuses seeded');
        }
        const categoriesCount = await this.categoryModel.countDocuments();
        if (categoriesCount === 0) {
            const categories = [
                {
                    name: 'Fashion & Apparel',
                    description: 'Clothing, shoes, and accessories',
                    isActive: true,
                },
                {
                    name: 'Electronics & Gadgets',
                    description: 'Phones, laptops, and more',
                    isActive: true,
                },
                {
                    name: 'Food & Groceries',
                    description: 'Meals, snacks, and daily essentials',
                    isActive: true,
                },
                {
                    name: 'Books & Stationery',
                    description: 'Academic materials and office supplies',
                    isActive: true,
                },
                {
                    name: 'Home & Living',
                    description: 'Furniture and home decor',
                    isActive: true,
                },
                {
                    name: 'Beauty & Personal Care',
                    description: 'Skincare, makeup, and hygiene',
                    isActive: true,
                },
                {
                    name: 'Services',
                    description: 'Graphic design, tutoring, and more',
                    isActive: true,
                },
            ];
            await this.categoryModel.insertMany(categories);
            console.log('✅ Categories seeded');
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(campus_schema_1.Campus.name)),
    __param(1, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], SeedService);
//# sourceMappingURL=seed.service.js.map