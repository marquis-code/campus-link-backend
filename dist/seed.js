"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const mongoose_1 = require("@nestjs/mongoose");
const bcrypt = __importStar(require("bcryptjs"));
async function seed() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const CampusModel = app.get((0, mongoose_1.getModelToken)('Campus'));
    const CategoryModel = app.get((0, mongoose_1.getModelToken)('Category'));
    const UserModel = app.get((0, mongoose_1.getModelToken)('User'));
    const ProductModel = app.get((0, mongoose_1.getModelToken)('Product'));
    const campuses = [
        { name: 'University of Lagos (UNILAG)', location: 'Lagos, Nigeria' },
        { name: 'Lagos State University (LASU)', location: 'Ojo, Lagos, Nigeria' },
        {
            name: 'Yaba College of Technology (YABATECH)',
            location: 'Yaba, Lagos, Nigeria',
        },
        {
            name: 'Obafemi Awolowo University (OAU)',
            location: 'Ile-Ife, Osun, Nigeria',
        },
        { name: 'University of Ibadan (UI)', location: 'Ibadan, Oyo, Nigeria' },
        {
            name: 'Federal University of Technology Akure (FUTA)',
            location: 'Akure, Ondo, Nigeria',
        },
        {
            name: 'University of Nigeria Nsukka (UNN)',
            location: 'Nsukka, Enugu, Nigeria',
        },
        {
            name: 'Nnamdi Azikiwe University (UNIZIK)',
            location: 'Awka, Anambra, Nigeria',
        },
        {
            name: 'Federal University of Technology Owerri (FUTO)',
            location: 'Owerri, Imo, Nigeria',
        },
        {
            name: 'University of Benin (UNIBEN)',
            location: 'Benin City, Edo, Nigeria',
        },
        {
            name: 'University of Port Harcourt (UNIPORT)',
            location: 'Port Harcourt, Rivers, Nigeria',
        },
        {
            name: 'University of Calabar (UNICAL)',
            location: 'Calabar, Cross River, Nigeria',
        },
        {
            name: 'Ahmadu Bello University (ABU)',
            location: 'Zaria, Kaduna, Nigeria',
        },
        {
            name: 'University of Ilorin (UNILORIN)',
            location: 'Ilorin, Kwara, Nigeria',
        },
        { name: 'Bayero University Kano (BUK)', location: 'Kano, Nigeria' },
        {
            name: 'University of Abuja (UNIABUJA)',
            location: 'Gwagwalada, Abuja, Nigeria',
        },
        { name: 'University of Oxford', location: 'Oxford, United Kingdom' },
        { name: 'University of Cambridge', location: 'Cambridge, United Kingdom' },
        { name: 'Imperial College London', location: 'London, United Kingdom' },
        { name: 'Harvard University', location: 'Cambridge, MA, USA' },
        { name: 'Stanford University', location: 'Stanford, CA, USA' },
        {
            name: 'Massachusetts Institute of Technology (MIT)',
            location: 'Cambridge, MA, USA',
        },
        { name: 'University of Toronto', location: 'Toronto, Canada' },
        {
            name: 'University of British Columbia (UBC)',
            location: 'Vancouver, Canada',
        },
        { name: 'University of Cape Town', location: 'Cape Town, South Africa' },
        { name: 'National University of Singapore (NUS)', location: 'Singapore' },
    ];
    for (const campus of campuses) {
        await CampusModel.findOneAndUpdate({ name: campus.name }, campus, {
            upsert: true,
        });
    }
    console.log('✅ Campuses seeded');
    const categories = [
        { name: 'Food', icon: '🍔', description: 'Food and beverages' },
        { name: 'Perfume', icon: '🧴', description: 'Perfumes and fragrances' },
        { name: 'Fashion', icon: '👗', description: 'Clothing and fashion items' },
        { name: 'Electronics', icon: '📱', description: 'Gadgets and electronics' },
        { name: 'Beauty', icon: '💄', description: 'Beauty and skincare products' },
        { name: 'Services', icon: '🛠️', description: 'Professional services' },
        {
            name: 'Books',
            icon: '📚',
            description: 'Books and educational materials',
        },
        { name: 'Health', icon: '💪', description: 'Health and fitness' },
        { name: 'Accessories', icon: '⌚', description: 'Accessories and jewelry' },
        { name: 'Others', icon: '📦', description: 'Other products' },
    ];
    const categoryMap = {};
    for (const category of categories) {
        const cat = await CategoryModel.findOneAndUpdate({ name: category.name }, category, { upsert: true, new: true });
        categoryMap[category.name] = cat._id;
    }
    console.log('✅ Categories seeded');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    const defaultCampus = await CampusModel.findOne({
        name: 'University of Lagos (UNILAG)',
    });
    await UserModel.findOneAndUpdate({ email: 'admin@campuslink.com' }, {
        name: 'CampusLink Admin',
        email: 'admin@campuslink.com',
        phone: '08000000000',
        role: 'admin',
        campus: defaultCampus._id,
        password: hashedPassword,
        isActive: true,
        isVerified: true,
    }, { upsert: true });
    console.log('✅ Admin user seeded (admin@campuslink.com / admin123)');
    const sellerPassword = await bcrypt.hash('password123', salt);
    const seller = await UserModel.findOneAndUpdate({ email: 'seller@campuslink.com' }, {
        name: 'John Seller',
        email: 'seller@campuslink.com',
        phone: '08111111111',
        role: 'seller',
        campus: defaultCampus._id,
        password: sellerPassword,
        isActive: true,
        isVerified: true,
    }, { upsert: true, new: true });
    console.log('✅ Seller user seeded (seller@campuslink.com / password123)');
    const studentPassword = await bcrypt.hash('password123', salt);
    await UserModel.findOneAndUpdate({ email: 'student@campuslink.com' }, {
        name: 'Jane Student',
        email: 'student@campuslink.com',
        phone: '08222222222',
        role: 'student',
        campus: defaultCampus._id,
        password: studentPassword,
        isActive: true,
        isVerified: true,
    }, { upsert: true });
    console.log('✅ Student user seeded (student@campuslink.com / password123)');
    const products = [
        {
            name: 'Gourmet Burger Combo',
            description: 'Double beef patty with extra cheese and fries',
            price: 4500,
            category: categoryMap['Food'],
            seller: seller._id,
            campus: defaultCampus._id,
            images: [
                'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
            ],
            stock: 50,
            commissionPercentage: 10,
            commissionAmount: 450,
            status: 'active',
        },
        {
            name: 'Savage Dior Perfume',
            description: 'Long lasting fragrance for men',
            price: 15000,
            category: categoryMap['Perfume'],
            seller: seller._id,
            campus: defaultCampus._id,
            images: [
                'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800',
            ],
            stock: 20,
            commissionPercentage: 15,
            commissionAmount: 2250,
            status: 'active',
        },
        {
            name: 'MacBook Pro M2 Sleeve',
            description: 'Leather sleeve for MacBook Pro 14-inch',
            price: 8000,
            category: categoryMap['Accessories'],
            seller: seller._id,
            campus: defaultCampus._id,
            images: [
                'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
            ],
            stock: 15,
            commissionPercentage: 12,
            commissionAmount: 960,
            status: 'active',
        },
        {
            name: 'Wireless Noise Cancelling Headphones',
            description: 'High fidelity audio with 40h battery life',
            price: 25000,
            category: categoryMap['Electronics'],
            seller: seller._id,
            campus: defaultCampus._id,
            images: [
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
            ],
            stock: 10,
            commissionPercentage: 8,
            commissionAmount: 2000,
            status: 'active',
        },
        {
            name: 'Organic Skincare Set',
            description: 'Natural ingredients for glowing skin',
            price: 12000,
            category: categoryMap['Beauty'],
            seller: seller._id,
            campus: defaultCampus._id,
            images: [
                'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
            ],
            stock: 30,
            commissionPercentage: 20,
            commissionAmount: 2400,
            status: 'active',
        },
    ];
    for (const product of products) {
        await ProductModel.findOneAndUpdate({ name: product.name }, product, {
            upsert: true,
        });
    }
    console.log('✅ Products seeded');
    await app.close();
    console.log('\n🎉 Seeding completed!');
    process.exit(0);
}
seed().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map