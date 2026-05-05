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
exports.CampusesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const cache_manager_1 = require("@nestjs/cache-manager");
const campus_schema_1 = require("../../schemas/campus.schema");
let CampusesService = class CampusesService {
    campusModel;
    cacheManager;
    CACHE_KEY = 'campuses_all';
    CACHE_TTL = 3600000;
    constructor(campusModel, cacheManager) {
        this.campusModel = campusModel;
        this.cacheManager = cacheManager;
    }
    async create(dto) {
        const campus = await this.campusModel.create(dto);
        await this.invalidateCache();
        return campus;
    }
    async findAll() {
        const cached = await this.cacheManager.get(this.CACHE_KEY);
        if (cached)
            return cached;
        const campuses = await this.campusModel.find({ isActive: true }).sort({ name: 1 }).lean();
        await this.cacheManager.set(this.CACHE_KEY, campuses, this.CACHE_TTL);
        return campuses;
    }
    async findAllAdmin() {
        return this.campusModel.find().sort({ name: 1 }).lean();
    }
    async findOne(id) {
        const campus = await this.campusModel.findById(id).lean();
        if (!campus)
            throw new common_1.NotFoundException('Campus not found');
        return campus;
    }
    async update(id, dto) {
        const campus = await this.campusModel
            .findByIdAndUpdate(id, { $set: dto }, { new: true })
            .lean();
        if (!campus)
            throw new common_1.NotFoundException('Campus not found');
        await this.invalidateCache();
        return campus;
    }
    async remove(id) {
        const campus = await this.campusModel.findByIdAndDelete(id);
        if (!campus)
            throw new common_1.NotFoundException('Campus not found');
        await this.invalidateCache();
        return { message: 'Campus deleted successfully' };
    }
    async invalidateCache() {
        await this.cacheManager.del(this.CACHE_KEY);
    }
};
exports.CampusesService = CampusesService;
exports.CampusesService = CampusesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(campus_schema_1.Campus.name)),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [mongoose_2.Model, Object])
], CampusesService);
//# sourceMappingURL=campuses.service.js.map