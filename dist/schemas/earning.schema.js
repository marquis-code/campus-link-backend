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
exports.EarningSchema = exports.Earning = exports.EarningStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var EarningStatus;
(function (EarningStatus) {
    EarningStatus["PENDING"] = "pending";
    EarningStatus["AVAILABLE"] = "available";
    EarningStatus["PAID"] = "paid";
})(EarningStatus || (exports.EarningStatus = EarningStatus = {}));
let Earning = class Earning {
    promoter;
    order;
    product;
    amount;
    status;
};
exports.Earning = Earning;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Earning.prototype, "promoter", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Order', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Earning.prototype, "order", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Product', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Earning.prototype, "product", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Earning.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: EarningStatus, default: EarningStatus.PENDING }),
    __metadata("design:type", String)
], Earning.prototype, "status", void 0);
exports.Earning = Earning = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Earning);
exports.EarningSchema = mongoose_1.SchemaFactory.createForClass(Earning);
exports.EarningSchema.index({ promoter: 1, status: 1 });
exports.EarningSchema.index({ order: 1 });
//# sourceMappingURL=earning.schema.js.map