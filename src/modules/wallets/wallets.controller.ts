import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('wallets')
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('my-wallet')
  async getMyWallet(@CurrentUser('_id') userId: string) {
    return this.walletsService.getOrCreateWallet(userId);
  }

  @Get('my-transactions')
  async getMyTransactions(
    @CurrentUser('_id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.walletsService.getTransactions(userId, page, limit);
  }

  @Post('fund-initialize')
  async initializeFunding(
    @CurrentUser('_id') userId: string,
    @CurrentUser('email') email: string,
    @Body() body: { amount: number; callbackUrl?: string }
  ) {
    return this.walletsService.initializeFunding(userId, body.amount, email, body.callbackUrl);
  }

  @Post('sync-earnings')
  async syncEarnings(@CurrentUser('_id') userId: string) {
    return this.walletsService.syncEarnings(userId);
  }
}
