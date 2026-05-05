"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const referrals_controller_1 = require("./referrals.controller");
const referrals_service_1 = require("./referrals.service");
const referral_schema_1 = require("../../schemas/referral.schema");
const product_schema_1 = require("../../schemas/product.schema");
const products_module_1 = require("../products/products.module");
let ReferralsModule = class ReferralsModule {
};
exports.ReferralsModule = ReferralsModule;
exports.ReferralsModule = ReferralsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: referral_schema_1.Referral.name, schema: referral_schema_1.ReferralSchema },
                { name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema },
            ]),
            products_module_1.ProductsModule,
        ],
        controllers: [referrals_controller_1.ReferralsController],
        providers: [referrals_service_1.ReferralsService],
        exports: [referrals_service_1.ReferralsService],
    })
], ReferralsModule);
//# sourceMappingURL=referrals.module.js.map