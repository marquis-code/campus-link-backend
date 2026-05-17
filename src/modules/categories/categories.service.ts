import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Category, CategoryDocument } from '../../schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  private readonly CACHE_KEY = 'categories_all';
  private readonly CACHE_TTL = 3600000; // 1 hour

  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateCategoryDto) {
    const category = await this.categoryModel.create(dto);
    await this.invalidateCache();
    return category;
  }

  async findAll() {
    const cached: any = await this.cacheManager.get(this.CACHE_KEY);
    if (cached) return cached;

    const categories = await this.categoryModel
      .find({ isActive: true })
      .sort({ name: 1 })
      .lean();
    await this.cacheManager.set(this.CACHE_KEY, categories, this.CACHE_TTL);
    return categories;
  }

  async findAllAdmin() {
    return this.categoryModel.find().sort({ name: 1 }).lean();
  }

  async findOne(id: string) {
    const category = await this.categoryModel.findById(id).lean();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean();
    if (!category) throw new NotFoundException('Category not found');
    await this.invalidateCache();
    return category;
  }

  async remove(id: string) {
    const category = await this.categoryModel.findByIdAndDelete(id);
    if (!category) throw new NotFoundException('Category not found');
    await this.invalidateCache();
    return { message: 'Category deleted successfully' };
  }

  private async invalidateCache() {
    await this.cacheManager.del(this.CACHE_KEY);
  }
}
