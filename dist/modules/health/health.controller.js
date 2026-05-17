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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let HealthController = class HealthController {
    mongooseConnection;
    cacheManager;
    constructor(mongooseConnection, cacheManager) {
        this.mongooseConnection = mongooseConnection;
        this.cacheManager = cacheManager;
    }
    async getHealth() {
        const errors = [];
        const dbState = this.mongooseConnection.readyState;
        let dbStatus = 'disconnected';
        if (dbState === 1) {
            dbStatus = 'connected';
        }
        else {
            dbStatus = 'unhealthy';
            errors.push(`Database connection state: ${dbState}`);
        }
        let redisStatus = 'unknown';
        try {
            await this.cacheManager.set('health-check-key', 'ok');
            const val = await this.cacheManager.get('health-check-key');
            if (val === 'ok') {
                redisStatus = 'healthy';
            }
            else {
                redisStatus = 'degraded';
                errors.push('Cache write-read mismatch');
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            redisStatus = 'unhealthy';
            errors.push(`Cache check failed: ${errorMessage}`);
        }
        const payload = {
            status: errors.length === 0 ? 'healthy' : 'unhealthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            services: {
                database: dbStatus,
                cache: redisStatus,
            },
        };
        if (errors.length > 0) {
            throw new common_1.ServiceUnavailableException({
                ...payload,
                errors,
            });
        }
        return payload;
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "getHealth", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [mongoose_2.Connection, Object])
], HealthController);
//# sourceMappingURL=health.controller.js.map