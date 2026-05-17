import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Campus, CampusDocument } from '../../schemas/campus.schema';
import { CreateCampusDto, UpdateCampusDto } from './dto/campus.dto';

@Injectable()
export class CampusesService {
  private readonly CACHE_KEY = 'campuses_all';
  private readonly CACHE_TTL = 3600000; // 1 hour

  constructor(
    @InjectModel(Campus.name) private campusModel: Model<CampusDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateCampusDto) {
    const campus = await this.campusModel.create(dto);
    await this.invalidateCache();
    return campus;
  }

  async findAll() {
    const cached: any = await this.cacheManager.get(this.CACHE_KEY);
    if (cached) return cached;

    const campuses = await this.campusModel
      .find({ isActive: true })
      .sort({ name: 1 })
      .lean();
    await this.cacheManager.set(this.CACHE_KEY, campuses, this.CACHE_TTL);
    return campuses;
  }

  async findAllAdmin() {
    return this.campusModel.find().sort({ name: 1 }).lean();
  }

  async findOne(id: string) {
    const campus = await this.campusModel.findById(id).lean();
    if (!campus) throw new NotFoundException('Campus not found');
    return campus;
  }

  async update(id: string, dto: UpdateCampusDto) {
    const campus = await this.campusModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean();
    if (!campus) throw new NotFoundException('Campus not found');
    await this.invalidateCache();
    return campus;
  }

  async remove(id: string) {
    const campus = await this.campusModel.findByIdAndDelete(id);
    if (!campus) throw new NotFoundException('Campus not found');
    await this.invalidateCache();
    return { message: 'Campus deleted successfully' };
  }

  private async invalidateCache() {
    await this.cacheManager.del(this.CACHE_KEY);
  }
}
