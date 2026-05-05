import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto, UpdateWithdrawalStatusDto } from './dto/withdrawal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../schemas/user.schema';

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private withdrawalsService: WithdrawalsService) {}

  // Student: request withdrawal
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  create(
    @CurrentUser('_id') userId: string,
    @Body() dto: CreateWithdrawalDto,
  ) {
    return this.withdrawalsService.create(userId, dto);
  }

  // Student: my withdrawal history
  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  findMine(@CurrentUser('_id') userId: string) {
    return this.withdrawalsService.findMyWithdrawals(userId);
  }

  // Admin: all withdrawals
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('status') status: string,
  ) {
    return this.withdrawalsService.findAll(page, limit, status);
  }

  // Admin: approve/reject withdrawal
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('_id') adminId: string,
    @Body() dto: UpdateWithdrawalStatusDto,
  ) {
    return this.withdrawalsService.updateStatus(id, dto, adminId);
  }
}
