import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order, OrderSchema } from '../../schemas/order.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { Referral, ReferralSchema } from '../../schemas/referral.schema';
import { Earning, EarningSchema } from '../../schemas/earning.schema';
import { Notification, NotificationSchema } from '../../schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Referral.name, schema: ReferralSchema },
      { name: Earning.name, schema: EarningSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
