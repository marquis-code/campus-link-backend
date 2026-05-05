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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../schemas/user.schema");
const product_schema_1 = require("../../schemas/product.schema");
const order_schema_1 = require("../../schemas/order.schema");
const earning_schema_1 = require("../../schemas/earning.schema");
const referral_schema_1 = require("../../schemas/referral.schema");
const withdrawal_schema_1 = require("../../schemas/withdrawal.schema");
let AdminService = class AdminService {
    userModel;
    productModel;
    orderModel;
    earningModel;
    referralModel;
    withdrawalModel;
    constructor(userModel, productModel, orderModel, earningModel, referralModel, withdrawalModel) {
        this.userModel = userModel;
        this.productModel = productModel;
        this.orderModel = orderModel;
        this.earningModel = earningModel;
        this.referralModel = referralModel;
        this.withdrawalModel = withdrawalModel;
    }
    async getStats() {
        const [totalUsers, totalStudents, totalSellers, totalProducts, activeProducts, pendingProducts, totalOrders, confirmedOrders, pendingOrders, totalReferrals, pendingWithdrawals, totalRevenueResult, totalEarningsResult, totalWithdrawnResult,] = await Promise.all([
            this.userModel.countDocuments(),
            this.userModel.countDocuments({ role: 'student' }),
            this.userModel.countDocuments({ role: 'seller' }),
            this.productModel.countDocuments(),
            this.productModel.countDocuments({ status: 'active' }),
            this.productModel.countDocuments({ status: 'pending' }),
            this.orderModel.countDocuments(),
            this.orderModel.countDocuments({ status: 'confirmed' }),
            this.orderModel.countDocuments({ status: 'pending' }),
            this.referralModel.countDocuments(),
            this.withdrawalModel.countDocuments({ status: 'pending' }),
            this.orderModel.aggregate([
                { $match: { status: 'confirmed' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]),
            this.earningModel.aggregate([
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            this.withdrawalModel.aggregate([
                { $match: { status: { $in: ['approved', 'completed'] } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
        ]);
        return {
            users: { total: totalUsers, students: totalStudents, sellers: totalSellers },
            products: { total: totalProducts, active: activeProducts, pending: pendingProducts },
            orders: { total: totalOrders, confirmed: confirmedOrders, pending: pendingOrders },
            referrals: { total: totalReferrals },
            withdrawals: { pending: pendingWithdrawals },
            revenue: {
                totalSales: totalRevenueResult[0]?.total || 0,
                totalEarnings: totalEarningsResult[0]?.total || 0,
                totalWithdrawn: totalWithdrawnResult[0]?.total || 0,
            },
        };
    }
    async getUsers(query) {
        const { role, page = 1, limit = 20, search } = query;
        const filter = {};
        if (role)
            filter.role = role;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.userModel
                .find(filter)
                .select('-password')
                .populate('campus', 'name')
                .sort('-createdAt')
                .skip(skip)
                .limit(limit)
                .lean(),
            this.userModel.countDocuments(filter),
        ]);
        return { users, total, page, pages: Math.ceil(total / limit) };
    }
    async updateUserStatus(userId, isActive) {
        return this.userModel
            .findByIdAndUpdate(userId, { isActive }, { new: true })
            .select('-password')
            .populate('campus', 'name')
            .lean();
    }
    async getRecentOrders(limit = 10) {
        return this.orderModel
            .find()
            .populate('product', 'name price')
            .populate('seller', 'name')
            .populate('promoter', 'name')
            .sort('-createdAt')
            .limit(limit)
            .lean();
    }
    async getTopPromoters(limit = 10) {
        return this.earningModel.aggregate([
            { $group: { _id: '$promoter', totalEarnings: { $sum: '$amount' }, salesCount: { $sum: 1 } } },
            { $sort: { totalEarnings: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'promoter',
                },
            },
            { $unwind: '$promoter' },
            {
                $project: {
                    'promoter.password': 0,
                },
            },
        ]);
    }
    async getTopProducts(limit = 10) {
        return this.productModel
            .find({ status: 'active' })
            .sort('-totalSales')
            .limit(limit)
            .populate('seller', 'name')
            .populate('campus', 'name')
            .lean();
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(2, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(3, (0, mongoose_1.InjectModel)(earning_schema_1.Earning.name)),
    __param(4, (0, mongoose_1.InjectModel)(referral_schema_1.Referral.name)),
    __param(5, (0, mongoose_1.InjectModel)(withdrawal_schema_1.Withdrawal.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AdminService);
//# sourceMappingURL=admin.service.js.map