import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { nanoid } from 'nanoid';
import { Referral, ReferralDocument } from '../../schemas/referral.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ReferralsService {
  constructor(
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private productsService: ProductsService,
  ) {}

  async generate(promoterId: string, productId: string) {
    // Check if product exists and is active
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');
    if (product.status !== 'active') {
      throw new BadRequestException('Product is not active');
    }

    // Check if seller is trying to promote their own product
    if (product.seller.toString() === promoterId) {
      throw new BadRequestException('You cannot promote your own product');
    }

    // Check if referral already exists for this user + product
    const existing = await this.referralModel.findOne({
      product: new Types.ObjectId(productId),
      promoter: new Types.ObjectId(promoterId),
    });

    if (existing) {
      return this.referralModel
        .findById(existing._id)
        .populate('product', 'name price commissionAmount images')
        .populate('promoter', 'name email')
        .lean();
    }

    // Generate unique referral code
    const referralCode = nanoid(8);

    const referral = await this.referralModel.create({
      product: new Types.ObjectId(productId),
      promoter: new Types.ObjectId(promoterId),
      referralCode,
    });

    // Increment product promoters count
    await this.productsService.incrementPromoters(productId);

    return this.referralModel
      .findById(referral._id)
      .populate('product', 'name price commissionAmount images')
      .populate('promoter', 'name email')
      .lean();
  }

  async findMyReferrals(promoterId: string) {
    return this.referralModel
      .find({ promoter: new Types.ObjectId(promoterId) })
      .populate('product', 'name price commissionAmount images status')
      .sort('-createdAt')
      .lean();
  }

  async trackClick(referralCode: string) {
    const referral = await this.referralModel.findOne({ referralCode });
    if (!referral) throw new NotFoundException('Referral not found');

    // Increment click count
    await this.referralModel.findByIdAndUpdate(referral._id, {
      $inc: { clicks: 1 },
    });

    // Return product info for redirect
    const product = await this.productModel
      .findById(referral.product)
      .populate('seller', 'name phone')
      .populate('campus', 'name')
      .lean();

    return {
      product,
      referralCode,
      promoterId: referral.promoter,
    };
  }

  async findByProduct(productId: string) {
    return this.referralModel
      .find({ product: new Types.ObjectId(productId) })
      .populate('promoter', 'name email avatar')
      .sort('-earnings')
      .lean();
  }

  async findByCode(referralCode: string) {
    return this.referralModel
      .findOne({ referralCode })
      .populate('product')
      .populate('promoter', 'name email')
      .lean();
  }

  async incrementOrdersAndEarnings(
    referralId: string,
    commissionAmount: number,
  ) {
    await this.referralModel.findByIdAndUpdate(referralId, {
      $inc: { orders: 1, earnings: commissionAmount },
    });
  }
}
