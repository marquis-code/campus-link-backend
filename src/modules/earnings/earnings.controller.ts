import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EarningsService } from './earnings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../schemas/user.schema';

@Controller('earnings')
export class EarningsController {
  constructor(private earningsService: EarningsService) {}

  // Student: get my earnings
  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  findMine(@CurrentUser('_id') userId: string) {
    return this.earningsService.findMyEarnings(userId);
  }

  // Student: get earnings summary
  @Get('summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  getSummary(@CurrentUser('_id') userId: string) {
    return this.earningsService.getEarningsSummary(userId);
  }

  // Admin: all earnings
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query('page') page: number, @Query('limit') limit: number) {
    return this.earningsService.findAll(page, limit);
  }
}
