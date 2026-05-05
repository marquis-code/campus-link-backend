import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WithdrawalsController } from './withdrawals.controller';
import { WithdrawalsService } from './withdrawals.service';
import { Withdrawal, WithdrawalSchema } from '../../schemas/withdrawal.schema';
import { User, UserSchema } from '../../schemas/user.schema';
import { Notification, NotificationSchema } from '../../schemas/notification.schema';
import { EarningsModule } from '../earnings/earnings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Withdrawal.name, schema: WithdrawalSchema },
      { name: User.name, schema: UserSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    EarningsModule,
  ],
  controllers: [WithdrawalsController],
  providers: [WithdrawalsService],
  exports: [WithdrawalsService],
})
export class WithdrawalsModule {}
