"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const auth_module_1 = require("./modules/auth/auth.module");
const campuses_module_1 = require("./modules/campuses/campuses.module");
const categories_module_1 = require("./modules/categories/categories.module");
const products_module_1 = require("./modules/products/products.module");
const referrals_module_1 = require("./modules/referrals/referrals.module");
const orders_module_1 = require("./modules/orders/orders.module");
const earnings_module_1 = require("./modules/earnings/earnings.module");
const withdrawals_module_1 = require("./modules/withdrawals/withdrawals.module");
const ai_module_1 = require("./modules/ai/ai.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const admin_module_1 = require("./modules/admin/admin.module");
const upload_module_1 = require("./modules/upload/upload.module");
const chat_module_1 = require("./modules/chat/chat.module");
const mail_module_1 = require("./modules/mail/mail.module");
const firebase_module_1 = require("./modules/firebase/firebase.module");
const seed_module_1 = require("./common/services/seed.module");
const health_module_1 = require("./modules/health/health.module");
const cache_manager_1 = require("@nestjs/cache-manager");
const redisStore = __importStar(require("cache-manager-redis-yet"));
const shared_module_1 = require("./shared/services/shared.module");
const payments_module_1 = require("./modules/payments/payments.module");
const wallets_module_1 = require("./modules/wallets/wallets.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    uri: configService.get('MONGODB_URI'),
                }),
                inject: [config_1.ConfigService],
            }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const redisUrl = configService.get('REDIS_URL');
                    if (!redisUrl || redisUrl === 'memory') {
                        console.log('Using in-memory cache');
                        return { ttl: 600 };
                    }
                    try {
                        const store = await redisStore.redisStore({
                            url: redisUrl,
                            socket: {
                                connectTimeout: 5000,
                                reconnectStrategy: (retries) => {
                                    if (retries > 5) {
                                        console.warn('Redis reconnection failed too many times. Continuing with broken cache.');
                                        return false;
                                    }
                                    return Math.min(retries * 100, 3000);
                                },
                            },
                        });
                        if (store.client) {
                            store.client.on('error', (err) => {
                                console.error('Redis Client Error (Non-Fatal):', err.message);
                            });
                        }
                        return { store };
                    }
                    catch (e) {
                        console.error('Failed to connect to Redis, falling back to memory cache:', e.message);
                        return { ttl: 600 };
                    }
                },
                inject: [config_1.ConfigService],
            }),
            shared_module_1.SharedModule,
            auth_module_1.AuthModule,
            campuses_module_1.CampusesModule,
            categories_module_1.CategoriesModule,
            products_module_1.ProductsModule,
            referrals_module_1.ReferralsModule,
            orders_module_1.OrdersModule,
            earnings_module_1.EarningsModule,
            withdrawals_module_1.WithdrawalsModule,
            ai_module_1.AiModule,
            notifications_module_1.NotificationsModule,
            admin_module_1.AdminModule,
            upload_module_1.UploadModule,
            chat_module_1.ChatModule,
            mail_module_1.MailModule,
            firebase_module_1.FirebaseModule,
            seed_module_1.SeedModule,
            payments_module_1.PaymentsModule,
            wallets_module_1.WalletsModule,
            health_module_1.HealthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map