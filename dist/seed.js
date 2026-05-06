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
    const campuses = [
        { name: 'University of Lagos (UNILAG)', location: 'Lagos, Nigeria' },
        { name: 'Lagos State University (LASU)', location: 'Ojo, Lagos, Nigeria' },
        { name: 'Yaba College of Technology (YABATECH)', location: 'Yaba, Lagos, Nigeria' },
        { name: 'Obafemi Awolowo University (OAU)', location: 'Ile-Ife, Osun, Nigeria' },
        { name: 'University of Ibadan (UI)', location: 'Ibadan, Oyo, Nigeria' },
        { name: 'Federal University of Technology Akure (FUTA)', location: 'Akure, Ondo, Nigeria' },
        { name: 'University of Nigeria Nsukka (UNN)', location: 'Nsukka, Enugu, Nigeria' },
        { name: 'Nnamdi Azikiwe University (UNIZIK)', location: 'Awka, Anambra, Nigeria' },
        { name: 'Federal University of Technology Owerri (FUTO)', location: 'Owerri, Imo, Nigeria' },
        { name: 'University of Benin (UNIBEN)', location: 'Benin City, Edo, Nigeria' },
        { name: 'University of Port Harcourt (UNIPORT)', location: 'Port Harcourt, Rivers, Nigeria' },
        { name: 'University of Calabar (UNICAL)', location: 'Calabar, Cross River, Nigeria' },
        { name: 'Ahmadu Bello University (ABU)', location: 'Zaria, Kaduna, Nigeria' },
        { name: 'University of Ilorin (UNILORIN)', location: 'Ilorin, Kwara, Nigeria' },
        { name: 'Bayero University Kano (BUK)', location: 'Kano, Nigeria' },
        { name: 'University of Abuja (UNIABUJA)', location: 'Gwagwalada, Abuja, Nigeria' },
        { name: 'University of Oxford', location: 'Oxford, United Kingdom' },
        { name: 'University of Cambridge', location: 'Cambridge, United Kingdom' },
        { name: 'Imperial College London', location: 'London, United Kingdom' },
        { name: 'Harvard University', location: 'Cambridge, MA, USA' },
        { name: 'Stanford University', location: 'Stanford, CA, USA' },
        { name: 'Massachusetts Institute of Technology (MIT)', location: 'Cambridge, MA, USA' },
        { name: 'University of Toronto', location: 'Toronto, Canada' },
        { name: 'University of British Columbia (UBC)', location: 'Vancouver, Canada' },
        { name: 'University of Cape Town', location: 'Cape Town, South Africa' },
        { name: 'National University of Singapore (NUS)', location: 'Singapore' },
    ];
    for (const campus of campuses) {
        await CampusModel.findOneAndUpdate({ name: campus.name }, campus, { upsert: true });
    }
    console.log('✅ Campuses seeded');
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
        await CategoryModel.findOneAndUpdate({ name: category.name }, category, { upsert: true });
    }
    console.log('✅ Categories seeded');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    const defaultCampus = await CampusModel.findOne({ name: 'University of Lagos (UNILAG)' });
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
    await app.close();
    console.log('\n🎉 Seeding completed!');
    process.exit(0);
}
seed().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map