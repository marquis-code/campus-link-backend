import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findMine(
    @CurrentUser('_id') userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.notificationsService.findByUser(userId, page, limit);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser('_id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id') id: string,
    @CurrentUser('_id') userId: string,
  ) {
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser('_id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }
}
