import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Earning, EarningDocument } from '../../schemas/earning.schema';

@Injectable()
export class EarningsService {
  constructor(
    @InjectModel(Earning.name) private earningModel: Model<EarningDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findMyEarnings(promoterId: string) {
    return this.earningModel
      .find({ promoter: new Types.ObjectId(promoterId) } as any)
      .populate('product', 'name price images')
      .populate('order', 'buyerName status totalAmount createdAt')
      .sort('-createdAt')
      .lean();
  }

  async getEarningsSummary(promoterId: string) {
    const cacheKey = `earnings_summary_${promoterId}`;
    const cached: any = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const promoterObjId = new Types.ObjectId(promoterId);

    const [totalResult, pendingResult, availableResult, paidResult] =
      await Promise.all([
        this.earningModel.aggregate([
          { $match: { promoter: promoterObjId } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        this.earningModel.aggregate([
          { $match: { promoter: promoterObjId, status: 'pending' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        this.earningModel.aggregate([
          { $match: { promoter: promoterObjId, status: 'available' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        this.earningModel.aggregate([
          { $match: { promoter: promoterObjId, status: 'paid' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);

    const totalEarnings = totalResult[0]?.total || 0;
    const pendingEarnings = pendingResult[0]?.total || 0;
    const availableEarnings = availableResult[0]?.total || 0;
    const paidEarnings = paidResult[0]?.total || 0;

    const totalSales = await this.earningModel.countDocuments({
      promoter: promoterObjId,
    } as any);

    const summary = {
      totalEarnings,
      pendingEarnings,
      availableEarnings,
      paidEarnings,
      totalSales,
    };

    // Cache for 2 minutes — earnings change more frequently
    await this.cacheManager.set(cacheKey, summary, 120000);
    return summary;
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [earnings, total] = await Promise.all([
      this.earningModel
        .find()
        .populate('promoter', 'name email')
        .populate('product', 'name price')
        .populate('order', 'buyerName status totalAmount')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      this.earningModel.countDocuments(),
    ]);
    return { earnings, total, page, pages: Math.ceil(total / limit) };
  }

  async markEarningsAsPaid(promoterId: string, amount: number) {
    const earnings = await this.earningModel
      .find({
        promoter: new Types.ObjectId(promoterId),
        status: 'available',
      } as any)
      .sort('createdAt');

    let remaining = amount;
    for (const earning of earnings) {
      if (remaining <= 0) break;
      (earning as any).status = 'paid';
      await earning.save();
      remaining -= earning.amount;
    }

    // Invalidate the cached summary after status changes
    await this.invalidateSummaryCache(promoterId);
  }

  async invalidateSummaryCache(promoterId: string) {
    await this.cacheManager.del(`earnings_summary_${promoterId}`);
  }
}
