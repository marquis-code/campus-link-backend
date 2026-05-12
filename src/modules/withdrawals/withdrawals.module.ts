import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WithdrawalsController } from './withdrawals.controller';
import { WithdrawalsService } from './withdrawals.service';
import { Withdrawal, WithdrawalSchema } from '../../schemas/withdrawal.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Order, OrderSchema } from '../../schemas/order.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { EarningsModule } from '../earnings/earnings.module';
import { SharedModule } from '../../shared/services/shared.module';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Withdrawal.name, schema: WithdrawalSchema },
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    EarningsModule,
    NotificationsModule,
    SharedModule,
    WalletsModule,
  ],
  controllers: [WithdrawalsController],
  providers: [WithdrawalsService],
  exports: [WithdrawalsService],
})
export class WithdrawalsModule {}
