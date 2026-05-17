import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campus, CampusDocument } from '../../schemas/campus.schema';
import { Category, CategoryDocument } from '../../schemas/category.schema';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Campus.name) private campusModel: Model<CampusDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async seed() {
    // Seed Campuses
    const campusesCount = await this.campusModel.countDocuments();
    if (campusesCount === 0) {
      const campuses = [
        { name: 'University of Lagos', address: 'Akoka, Yaba', isActive: true },
        {
          name: 'University of Ibadan',
          address: 'Ibadan, Oyo State',
          isActive: true,
        },
        {
          name: 'Obafemi Awolowo University',
          address: 'Ile-Ife, Osun State',
          isActive: true,
        },
        {
          name: 'Covenant University',
          address: 'Ota, Ogun State',
          isActive: true,
        },
        {
          name: 'University of Nigeria, Nsukka',
          address: 'Nsukka, Enugu State',
          isActive: true,
        },
        {
          name: 'Lagos State University',
          address: 'Ojo, Lagos',
          isActive: true,
        },
        {
          name: 'Ahmadu Bello University',
          address: 'Zaria, Kaduna State',
          isActive: true,
        },
        {
          name: 'University of Benin',
          address: 'Benin City, Edo State',
          isActive: true,
        },
        {
          name: 'Federal University of Technology, Akure',
          address: 'Akure, Ondo State',
          isActive: true,
        },
        {
          name: 'Babcock University',
          address: 'Ilishan-Remo, Ogun State',
          isActive: true,
        },
      ];
      await this.campusModel.insertMany(campuses);
      console.log('✅ Campuses seeded');
    }

    // Seed Categories
    const categoriesCount = await this.categoryModel.countDocuments();
    if (categoriesCount === 0) {
      const categories = [
        {
          name: 'Fashion & Apparel',
          description: 'Clothing, shoes, and accessories',
          isActive: true,
        },
        {
          name: 'Electronics & Gadgets',
          description: 'Phones, laptops, and more',
          isActive: true,
        },
        {
          name: 'Food & Groceries',
          description: 'Meals, snacks, and daily essentials',
          isActive: true,
        },
        {
          name: 'Books & Stationery',
          description: 'Academic materials and office supplies',
          isActive: true,
        },
        {
          name: 'Home & Living',
          description: 'Furniture and home decor',
          isActive: true,
        },
        {
          name: 'Beauty & Personal Care',
          description: 'Skincare, makeup, and hygiene',
          isActive: true,
        },
        {
          name: 'Services',
          description: 'Graphic design, tutoring, and more',
          isActive: true,
        },
      ];
      await this.categoryModel.insertMany(categories);
      console.log('✅ Categories seeded');
    }
  }
}
