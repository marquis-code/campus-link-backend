import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // Get models
  const CampusModel = app.get(getModelToken('Campus'));
  const CategoryModel = app.get(getModelToken('Category'));
  const UserModel = app.get(getModelToken('User'));

  // Seed Campuses
  const campuses = [
    { name: 'UNILAG', location: 'Lagos' },
    { name: 'YABATECH', location: 'Lagos' },
    { name: 'LASU', location: 'Lagos' },
    { name: 'UI', location: 'Ibadan' },
    { name: 'OAU', location: 'Ile-Ife' },
    { name: 'UNILORIN', location: 'Ilorin' },
    { name: 'ABU', location: 'Zaria' },
    { name: 'UNIBEN', location: 'Benin City' },
    { name: 'UNN', location: 'Nsukka' },
    { name: 'FUTA', location: 'Akure' },
  ];

  for (const campus of campuses) {
    await CampusModel.findOneAndUpdate(
      { name: campus.name },
      campus,
      { upsert: true },
    );
  }
  console.log('✅ Campuses seeded');

  // Seed Categories
  const categories = [
    { name: 'Food', icon: '🍔', description: 'Food and beverages' },
    { name: 'Perfume', icon: '🧴', description: 'Perfumes and fragrances' },
    { name: 'Fashion', icon: '👗', description: 'Clothing and fashion items' },
    { name: 'Electronics', icon: '📱', description: 'Gadgets and electronics' },
    { name: 'Beauty', icon: '💄', description: 'Beauty and skincare products' },
    { name: 'Services', icon: '🛠️', description: 'Professional services' },
    { name: 'Books', icon: '📚', description: 'Books and educational materials' },
    { name: 'Health', icon: '💪', description: 'Health and fitness' },
    { name: 'Accessories', icon: '⌚', description: 'Accessories and jewelry' },
    { name: 'Others', icon: '📦', description: 'Other products' },
  ];

  for (const category of categories) {
    await CategoryModel.findOneAndUpdate(
      { name: category.name },
      category,
      { upsert: true },
    );
  }
  console.log('✅ Categories seeded');

  // Seed Admin User
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  const defaultCampus = await CampusModel.findOne({ name: 'UNILAG' });

  await UserModel.findOneAndUpdate(
    { email: 'admin@campuslink.com' },
    {
      name: 'CampusLink Admin',
      email: 'admin@campuslink.com',
      phone: '08000000000',
      role: 'admin',
      campus: defaultCampus._id,
      password: hashedPassword,
      isActive: true,
      isVerified: true,
    },
    { upsert: true },
  );
  console.log('✅ Admin user seeded (admin@campuslink.com / admin123)');

  await app.close();
  console.log('\n🎉 Seeding completed!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
