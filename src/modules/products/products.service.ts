import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { Product, ProductDocument, ProductStatus } from '../../schemas/product.schema';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateProductStatusDto,
  ProductQueryDto,
} from './dto/product.dto';

import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private notificationsService: NotificationsService,
  ) {}

  async create(sellerId: string, dto: CreateProductDto) {
    const product = await this.productModel.create({
      ...dto,
      seller: new Types.ObjectId(sellerId),
      campus: new Types.ObjectId(dto.campus),
      category: dto.category ? new Types.ObjectId(dto.category) : undefined,
    });

    return this.productModel
      .findById(product._id)
      .populate('seller', 'name email phone')
      .populate('campus', 'name')
      .populate('category', 'name icon')
      .lean();
  }

  async findAll(query: ProductQueryDto) {
    const cacheKey = `products_${JSON.stringify(query)}`;
    const cached: any = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const {
      campus,
      category,
      search,
      status = ProductStatus.ACTIVE,
      page = 1,
      limit = 20,
      sort = '-createdAt',
    } = query;

    const filter: any = {};

    if (status) filter.status = status;
    if (campus) filter.campus = new Types.ObjectId(campus);
    if (category) filter.category = new Types.ObjectId(category);
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('seller', 'name email avatar')
        .populate('campus', 'name')
        .populate('category', 'name icon')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.productModel.countDocuments(filter),
    ]);

    const result = {
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    };

    await this.cacheManager.set(cacheKey, result, 600000); // 10 mins cache
    return result;
  }

  async findOne(id: string) {
    const product = await this.productModel
      .findById(id)
      .populate('seller', 'name email phone avatar')
      .populate('campus', 'name location')
      .populate('category', 'name icon')
      .lean();

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findBySeller(sellerId: string, query: ProductQueryDto) {
    const { page = 1, limit = 20, status } = query;
    const filter: any = { seller: new Types.ObjectId(sellerId) };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('campus', 'name')
        .populate('category', 'name icon')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      this.productModel.countDocuments(filter),
    ]);

    return { products, total, page, pages: Math.ceil(total / limit) };
  }

  async update(id: string, sellerId: string, dto: UpdateProductDto) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    if (product.seller.toString() !== sellerId.toString()) {
      throw new ForbiddenException('You can only update your own products');
    }

    const updateData: any = { ...dto };
    if (dto.category) updateData.category = new Types.ObjectId(dto.category);

    return this.productModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate('seller', 'name email')
      .populate('campus', 'name')
      .populate('category', 'name icon')
      .lean();
  }

  async updateStatus(id: string, dto: UpdateProductStatusDto) {
    const product = await this.productModel
      .findByIdAndUpdate(id, { $set: { status: dto.status } }, { new: true })
      .populate('seller', 'name email')
      .populate('campus', 'name')
      .lean();

    if (!product) throw new NotFoundException('Product not found');

    // Notify seller
    const seller = product.seller as any;
    if (dto.status === ProductStatus.ACTIVE) {
      await this.notificationsService.notifyProductApproved(
        seller._id.toString(),
        seller.email,
        product.name,
      );
    } else if (dto.status === ProductStatus.REJECTED) {
      await this.notificationsService.notifyProductRejected(
        seller._id.toString(),
        seller.email,
        product.name,
        'Does not meet our community guidelines', // You can add a reason field to UpdateProductStatusDto later
      );
    }

    return product;
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    if (!isAdmin && product.seller.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.productModel.findByIdAndDelete(id);
    return { message: 'Product deleted successfully' };
  }

  async incrementSales(productId: string) {
    await this.productModel.findByIdAndUpdate(productId, {
      $inc: { totalSales: 1 },
    });
  }

  async incrementPromoters(productId: string) {
    await this.productModel.findByIdAndUpdate(productId, {
      $inc: { totalPromoters: 1 },
    });
  }

  async decrementPromoters(productId: string) {
    await this.productModel.findByIdAndUpdate(productId, {
      $inc: { totalPromoters: -1 },
    });
  }

  async updateAiCopy(id: string, copy: string) {
    return this.productModel
      .findByIdAndUpdate(id, { $set: { aiGeneratedCopy: copy } }, { new: true })
      .lean();
  }

  // Admin: get all products for moderation
  async findAllAdmin(query: ProductQueryDto) {
    const { page = 1, limit = 20, status, search } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('seller', 'name email')
        .populate('campus', 'name')
        .populate('category', 'name icon')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      this.productModel.countDocuments(filter),
    ]);

    return { products, total, page, pages: Math.ceil(total / limit) };
  }
}
