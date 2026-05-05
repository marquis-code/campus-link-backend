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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSchema = exports.Product = exports.ProductStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["PENDING"] = "pending";
    ProductStatus["ACTIVE"] = "active";
    ProductStatus["REJECTED"] = "rejected";
    ProductStatus["INACTIVE"] = "inactive";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
let Product = class Product {
    seller;
    campus;
    category;
    name;
    description;
    price;
    commissionAmount;
    images;
    sellerWhatsapp;
    sellerPhone;
    status;
    totalSales;
    totalPromoters;
    aiGeneratedCopy;
};
exports.Product = Product;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Product.prototype, "seller", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Campus', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Product.prototype, "campus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Category' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Product.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Product.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Product.prototype, "commissionAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Product.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Product.prototype, "sellerWhatsapp", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Product.prototype, "sellerPhone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: ProductStatus, default: ProductStatus.PENDING }),
    __metadata("design:type", String)
], Product.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "totalSales", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Product.prototype, "totalPromoters", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Product.prototype, "aiGeneratedCopy", void 0);
exports.Product = Product = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Product);
exports.ProductSchema = mongoose_1.SchemaFactory.createForClass(Product);
exports.ProductSchema.index({ campus: 1, status: 1 });
exports.ProductSchema.index({ seller: 1 });
exports.ProductSchema.index({ category: 1 });
//# sourceMappingURL=product.schema.js.map