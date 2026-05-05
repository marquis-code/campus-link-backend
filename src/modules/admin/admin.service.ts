import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { Earning, EarningDocument } from '../../schemas/earning.schema';
import { Referral, ReferralDocument } from '../../schemas/referral.schema';
import { Withdrawal, WithdrawalDocument } from '../../schemas/withdrawal.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Earning.name) private earningModel: Model<EarningDocument>,
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
    @InjectModel(Withdrawal.name) private withdrawalModel: Model<WithdrawalDocument>,
  ) {}

  async getStats() {
    const [
      totalUsers,
      totalStudents,
      totalSellers,
      totalProducts,
      activeProducts,
      pendingProducts,
      totalOrders,
      confirmedOrders,
      pendingOrders,
      totalReferrals,
      pendingWithdrawals,
      totalRevenueResult,
      totalEarningsResult,
      totalWithdrawnResult,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ role: 'student' } as any),
      this.userModel.countDocuments({ role: 'seller' } as any),
      this.productModel.countDocuments(),
      this.productModel.countDocuments({ status: 'active' } as any),
      this.productModel.countDocuments({ status: 'pending' } as any),
      this.orderModel.countDocuments(),
      this.orderModel.countDocuments({ status: 'confirmed' } as any),
      this.orderModel.countDocuments({ status: 'pending' } as any),
      this.referralModel.countDocuments(),
      this.withdrawalModel.countDocuments({ status: 'pending' } as any),
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

  async getUsers(query: { role?: string; page?: number; limit?: number; search?: string }) {
    const { role, page = 1, limit = 20, search } = query;
    const filter: any = {};
    if (role) filter.role = role;
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

  async updateUserStatus(userId: string, isActive: boolean) {
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
      .find({ status: 'active' } as any)
      .sort('-totalSales')
      .limit(limit)
      .populate('seller', 'name')
      .populate('campus', 'name')
      .lean();
  }
}
