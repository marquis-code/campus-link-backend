import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { GenerateReferralDto } from './dto/referral.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../schemas/user.schema';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Controller('referrals')
export class ReferralsController {
  constructor(private referralsService: ReferralsService) {}

  // Student: generate referral link
  @Post()
  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  generate(
    @CurrentUser('_id') userId: string,
    @Body() dto: GenerateReferralDto,
  ) {
    return this.referralsService.generate(userId, dto.productId);
  }

  // Student: get my referrals
  @Get('me')
  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  findMine(@CurrentUser('_id') userId: string) {
    return this.referralsService.findMyReferrals(userId);
  }

  // Public: track referral click (used when buyer clicks link)
  @Get('track/:code')
  trackClick(@Param('code') code: string) {
    return this.referralsService.trackClick(code);
  }

  // Seller/Admin: get referrals for a product
  @Get('product/:id')
  @UseGuards(JwtAuthGuard)
  findByProduct(@Param('id', ParseObjectIdPipe) id: string) {
    return this.referralsService.findByProduct(id);
  }

  // Student: delete/archive referral
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  remove(
    @CurrentUser('_id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.referralsService.remove(userId, id);
  }
}
