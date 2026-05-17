import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from '../../schemas/notification.schema';
import { NotificationsGateway } from './notifications.gateway';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly mailService: MailService,
  ) {}

  /**
   * Core notification creator — pushes real-time + persists + optionally emails.
   */
  async create(data: {
    user: string | Types.ObjectId;
    title: string;
    message: string;
    type: string;
    meta?: Record<string, any>;
    sendEmail?: boolean;
    emailAddress?: string;
  }) {
    const userId =
      typeof data.user === 'string' ? data.user : data.user.toString();

    // Persist to DB
    const notification = await this.notificationModel.create({
      user: new Types.ObjectId(userId),
      title: data.title,
      message: data.message,
      type: data.type as any,
      meta: data.meta || {},
    });

    // Push real-time via WebSocket
    this.notificationsGateway.sendNotification(userId, notification);

    // Update unread count
    const unreadCount = await this.notificationModel.countDocuments({
      user: new Types.ObjectId(userId),
      isRead: false,
    });
    this.notificationsGateway.sendUnreadCount(userId, unreadCount);

    // Send email notification if user is offline or explicitly requested
    if (data.sendEmail && data.emailAddress) {
      this.mailService
        .sendMail(
          data.emailAddress,
          `CampusLink: ${data.title}`,
          this.buildNotificationEmail(data.title, data.message),
        )
        .catch(() => {});
    } else if (
      !this.notificationsGateway.isUserOnline(userId) &&
      data.emailAddress
    ) {
      // Aggressive: email offline users automatically
      this.mailService
        .sendMail(
          data.emailAddress,
          `CampusLink: ${data.title}`,
          this.buildNotificationEmail(data.title, data.message),
        )
        .catch(() => {});
    }

    this.logger.log(`Notification sent to ${userId}: ${data.title}`);
    return notification;
  }

  // ——— Convenience methods for common notification types ———

  async notifyNewOrder(
    sellerId: string,
    sellerEmail: string,
    orderRef: string,
    amount: number,
  ) {
    return this.create({
      user: sellerId,
      title: 'New Order Received! 🛒',
      message: `You have a new order #${orderRef} worth ₦${amount.toLocaleString()}`,
      type: NotificationType.ORDER,
      meta: { orderRef, amount },
      emailAddress: sellerEmail,
    });
  }

  async notifyEarning(
    promoterId: string,
    email: string,
    amount: number,
    productName: string,
  ) {
    return this.create({
      user: promoterId,
      title: 'Commission Earned! 💰',
      message: `You earned ₦${amount.toLocaleString()} from promoting "${productName}"`,
      type: NotificationType.EARNING,
      meta: { amount, productName },
      emailAddress: email,
    });
  }

  async notifyWithdrawalApproved(
    userId: string,
    email: string,
    amount: number,
  ) {
    return this.create({
      user: userId,
      title: 'Withdrawal Approved ✅',
      message: `Your withdrawal of ₦${amount.toLocaleString()} has been processed`,
      type: NotificationType.WITHDRAWAL,
      meta: { amount },
      sendEmail: true,
      emailAddress: email,
    });
  }

  async notifyWithdrawalRejected(
    userId: string,
    email: string,
    amount: number,
    reason: string,
  ) {
    return this.create({
      user: userId,
      title: 'Withdrawal Rejected ❌',
      message: `Your withdrawal of ₦${amount.toLocaleString()} was rejected: ${reason}`,
      type: NotificationType.WITHDRAWAL,
      meta: { amount, reason },
      sendEmail: true,
      emailAddress: email,
    });
  }

  async notifyProductApproved(
    sellerId: string,
    email: string,
    productName: string,
  ) {
    return this.create({
      user: sellerId,
      title: 'Product Approved! 🎉',
      message: `Your product "${productName}" is now live and available for promotion`,
      type: NotificationType.PRODUCT,
      meta: { productName },
      emailAddress: email,
    });
  }

  async notifyProductRejected(
    sellerId: string,
    email: string,
    productName: string,
    reason: string,
  ) {
    return this.create({
      user: sellerId,
      title: 'Product Rejected',
      message: `Your product "${productName}" was rejected: ${reason}`,
      type: NotificationType.PRODUCT,
      meta: { productName, reason },
      sendEmail: true,
      emailAddress: email,
    });
  }

  async notifyNewChatMessage(
    userId: string,
    senderName: string,
    preview: string,
  ) {
    return this.create({
      user: userId,
      title: `New message from ${senderName}`,
      message: preview.substring(0, 100),
      type: NotificationType.SYSTEM,
      meta: { senderName },
    });
  }

  // ——— Query methods ———

  async findByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const filter = { user: new Types.ObjectId(userId) } as any;
    const unreadFilter = {
      user: new Types.ObjectId(userId),
      isRead: false,
    } as any;

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

    return {
      notifications,
      total,
      unreadCount,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const result = await this.notificationModel.findOneAndUpdate(
      { _id: notificationId, user: new Types.ObjectId(userId) },
      { isRead: true },
      { new: true },
    );

    // Push updated unread count
    const unreadCount = await this.notificationModel.countDocuments({
      user: new Types.ObjectId(userId),
      isRead: false,
    });
    this.notificationsGateway.sendUnreadCount(userId, unreadCount);

    return result;
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { user: new Types.ObjectId(userId), isRead: false },
      { isRead: true } as any,
    );

    this.notificationsGateway.sendUnreadCount(userId, 0);
    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationModel.countDocuments({
      user: new Types.ObjectId(userId),
      isRead: false,
    });
    return { count };
  }

  // ——— Email template builder ———

  private buildNotificationEmail(title: string, message: string): string {
    return `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 40px 20px;">
        <div style="background: white; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 14px;"></div>
            <div>
              <h2 style="color: #1e293b; margin: 0; font-size: 18px;">${title}</h2>
            </div>
          </div>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">${message}</p>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">CampusLink — Promote & Earn</p>
          </div>
        </div>
      </div>
    `;
  }
}
