import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../schemas/user.schema';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getUsers(
    @Query('role') role: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ) {
    return this.adminService.getUsers({ role, page, limit, search });
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.adminService.updateUserStatus(id, isActive);
  }

  @Get('recent-orders')
  getRecentOrders(@Query('limit') limit: number) {
    return this.adminService.getRecentOrders(limit);
  }

  @Get('top-promoters')
  getTopPromoters(@Query('limit') limit: number) {
    return this.adminService.getTopPromoters(limit);
  }

  @Get('top-products')
  getTopProducts(@Query('limit') limit: number) {
    return this.adminService.getTopProducts(limit);
  }

  @Get('transactions')
  getAllTransactions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getAllTransactions(page, limit);
  }

  @Get('wallets')
  getAllWallets(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getAllWallets(page, limit);
  }
}
