"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const withdrawals_controller_1 = require("./withdrawals.controller");
const withdrawals_service_1 = require("./withdrawals.service");
const withdrawal_schema_1 = require("../../schemas/withdrawal.schema");
const user_schema_1 = require("../../schemas/user.schema");
const notification_schema_1 = require("../../schemas/notification.schema");
const earnings_module_1 = require("../earnings/earnings.module");
let WithdrawalsModule = class WithdrawalsModule {
};
exports.WithdrawalsModule = WithdrawalsModule;
exports.WithdrawalsModule = WithdrawalsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: withdrawal_schema_1.Withdrawal.name, schema: withdrawal_schema_1.WithdrawalSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: notification_schema_1.Notification.name, schema: notification_schema_1.NotificationSchema },
            ]),
            earnings_module_1.EarningsModule,
        ],
        controllers: [withdrawals_controller_1.WithdrawalsController],
        providers: [withdrawals_service_1.WithdrawalsService],
        exports: [withdrawals_service_1.WithdrawalsService],
    })
], WithdrawalsModule);
//# sourceMappingURL=withdrawals.module.js.map