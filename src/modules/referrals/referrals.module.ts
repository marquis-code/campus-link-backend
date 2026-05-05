import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';
import { Referral, ReferralSchema } from '../../schemas/referral.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Referral.name, schema: ReferralSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    ProductsModule,
  ],
  controllers: [ReferralsController],
  providers: [ReferralsService],
  exports: [ReferralsService],
})
export class ReferralsModule {}
