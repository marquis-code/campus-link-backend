import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, UserSchema } from '../../schemas/user.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { Order, OrderSchema } from '../../schemas/order.schema';
import { Earning, EarningSchema } from '../../schemas/earning.schema';
import { Referral, ReferralSchema } from '../../schemas/referral.schema';
import { Withdrawal, WithdrawalSchema } from '../../schemas/withdrawal.schema';
import { Wallet, WalletSchema } from '../../schemas/wallet.schema';
import {
  Transaction,
  TransactionSchema,
} from '../../schemas/transaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Earning.name, schema: EarningSchema },
      { name: Referral.name, schema: ReferralSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
