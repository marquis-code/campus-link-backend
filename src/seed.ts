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
    // Nigeria - South West
    { name: 'University of Lagos (UNILAG)', location: 'Lagos, Nigeria' },
    { name: 'Lagos State University (LASU)', location: 'Ojo, Lagos, Nigeria' },
    { name: 'Yaba College of Technology (YABATECH)', location: 'Yaba, Lagos, Nigeria' },
    { name: 'Obafemi Awolowo University (OAU)', location: 'Ile-Ife, Osun, Nigeria' },
    { name: 'University of Ibadan (UI)', location: 'Ibadan, Oyo, Nigeria' },
    { name: 'Federal University of Technology Akure (FUTA)', location: 'Akure, Ondo, Nigeria' },
    
    // Nigeria - South East
    { name: 'University of Nigeria Nsukka (UNN)', location: 'Nsukka, Enugu, Nigeria' },
    { name: 'Nnamdi Azikiwe University (UNIZIK)', location: 'Awka, Anambra, Nigeria' },
    { name: 'Federal University of Technology Owerri (FUTO)', location: 'Owerri, Imo, Nigeria' },
    
    // Nigeria - South South
    { name: 'University of Benin (UNIBEN)', location: 'Benin City, Edo, Nigeria' },
    { name: 'University of Port Harcourt (UNIPORT)', location: 'Port Harcourt, Rivers, Nigeria' },
    { name: 'University of Calabar (UNICAL)', location: 'Calabar, Cross River, Nigeria' },
    
    // Nigeria - North
    { name: 'Ahmadu Bello University (ABU)', location: 'Zaria, Kaduna, Nigeria' },
    { name: 'University of Ilorin (UNILORIN)', location: 'Ilorin, Kwara, Nigeria' },
    { name: 'Bayero University Kano (BUK)', location: 'Kano, Nigeria' },
    { name: 'University of Abuja (UNIABUJA)', location: 'Gwagwalada, Abuja, Nigeria' },
    
    // International - UK
    { name: 'University of Oxford', location: 'Oxford, United Kingdom' },
    { name: 'University of Cambridge', location: 'Cambridge, United Kingdom' },
    { name: 'Imperial College London', location: 'London, United Kingdom' },
    
    // International - US
    { name: 'Harvard University', location: 'Cambridge, MA, USA' },
    { name: 'Stanford University', location: 'Stanford, CA, USA' },
    { name: 'Massachusetts Institute of Technology (MIT)', location: 'Cambridge, MA, USA' },
    
    // International - Canada
    { name: 'University of Toronto', location: 'Toronto, Canada' },
    { name: 'University of British Columbia (UBC)', location: 'Vancouver, Canada' },
    
    // International - Others
    { name: 'University of Cape Town', location: 'Cape Town, South Africa' },
    { name: 'National University of Singapore (NUS)', location: 'Singapore' },
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

  const defaultCampus = await CampusModel.findOne({ name: 'University of Lagos (UNILAG)' });

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
