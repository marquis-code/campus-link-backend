import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EarningsController } from './earnings.controller';
import { EarningsService } from './earnings.service';
import { Earning, EarningSchema } from '../../schemas/earning.schema';
import { Order, OrderSchema } from '../../schemas/order.schema';
import { Withdrawal, WithdrawalSchema } from '../../schemas/withdrawal.schema';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Earning.name, schema: EarningSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
    ]),
    WalletsModule,
  ],
  controllers: [EarningsController],
  providers: [EarningsService],
  exports: [EarningsService],
})
export class EarningsModule {}
