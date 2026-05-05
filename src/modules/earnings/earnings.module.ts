import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EarningsController } from './earnings.controller';
import { EarningsService } from './earnings.service';
import { Earning, EarningSchema } from '../../schemas/earning.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Earning.name, schema: EarningSchema }]),
  ],
  controllers: [EarningsController],
  providers: [EarningsService],
  exports: [EarningsService],
})
export class EarningsModule {}
