import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from '../../schemas/notification.schema';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async findByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const filter = { user: new Types.ObjectId(userId) } as any;
    const unreadFilter = { user: new Types.ObjectId(userId), isRead: false } as any;

    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      this.notificationModel.countDocuments(filter),
      this.notificationModel.countDocuments(unreadFilter),
    ]);

    return { notifications, total, unreadCount, page, pages: Math.ceil(total / limit) };
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: notificationId, user: new Types.ObjectId(userId) } as any,
      { isRead: true },
      { new: true },
    );
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { user: new Types.ObjectId(userId), isRead: false } as any,
      { isRead: true } as any,
    );
    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationModel.countDocuments({
      user: new Types.ObjectId(userId),
      isRead: false,
    } as any);
    return { count };
  }

  async create(data: {
    user: string | Types.ObjectId;
    title: string;
    message: string;
    type: string;
    meta?: Record<string, any>;
  }) {
    const notification = await this.notificationModel.create({
      ...data,
      user: typeof data.user === 'string' ? new Types.ObjectId(data.user) : data.user,
    } as any);

    this.notificationsGateway.sendNotification(data.user.toString(), notification);
    
    return notification;
  }
}
