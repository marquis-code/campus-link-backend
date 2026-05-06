"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("../../schemas/notification.schema");
const notifications_gateway_1 = require("./notifications.gateway");
const mail_service_1 = require("../mail/mail.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    notificationModel;
    notificationsGateway;
    mailService;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(notificationModel, notificationsGateway, mailService) {
        this.notificationModel = notificationModel;
        this.notificationsGateway = notificationsGateway;
        this.mailService = mailService;
    }
    async create(data) {
        const userId = typeof data.user === 'string' ? data.user : data.user.toString();
        const notification = await this.notificationModel.create({
            user: new mongoose_2.Types.ObjectId(userId),
            title: data.title,
            message: data.message,
            type: data.type,
            meta: data.meta || {},
        });
        this.notificationsGateway.sendNotification(userId, notification);
        const unreadCount = await this.notificationModel.countDocuments({
            user: new mongoose_2.Types.ObjectId(userId),
            isRead: false,
        });
        this.notificationsGateway.sendUnreadCount(userId, unreadCount);
        if (data.sendEmail && data.emailAddress) {
            this.mailService.sendMail(data.emailAddress, `CampusLink: ${data.title}`, this.buildNotificationEmail(data.title, data.message)).catch(() => { });
        }
        else if (!this.notificationsGateway.isUserOnline(userId) && data.emailAddress) {
            this.mailService.sendMail(data.emailAddress, `CampusLink: ${data.title}`, this.buildNotificationEmail(data.title, data.message)).catch(() => { });
        }
        this.logger.log(`Notification sent to ${userId}: ${data.title}`);
        return notification;
    }
    async notifyNewOrder(sellerId, sellerEmail, orderRef, amount) {
        return this.create({
            user: sellerId,
            title: 'New Order Received! 🛒',
            message: `You have a new order #${orderRef} worth ₦${amount.toLocaleString()}`,
            type: notification_schema_1.NotificationType.ORDER,
            meta: { orderRef, amount },
            emailAddress: sellerEmail,
        });
    }
    async notifyEarning(promoterId, email, amount, productName) {
        return this.create({
            user: promoterId,
            title: 'Commission Earned! 💰',
            message: `You earned ₦${amount.toLocaleString()} from promoting "${productName}"`,
            type: notification_schema_1.NotificationType.EARNING,
            meta: { amount, productName },
            emailAddress: email,
        });
    }
    async notifyWithdrawalApproved(userId, email, amount) {
        return this.create({
            user: userId,
            title: 'Withdrawal Approved ✅',
            message: `Your withdrawal of ₦${amount.toLocaleString()} has been processed`,
            type: notification_schema_1.NotificationType.WITHDRAWAL,
            meta: { amount },
            sendEmail: true,
            emailAddress: email,
        });
    }
    async notifyWithdrawalRejected(userId, email, amount, reason) {
        return this.create({
            user: userId,
            title: 'Withdrawal Rejected ❌',
            message: `Your withdrawal of ₦${amount.toLocaleString()} was rejected: ${reason}`,
            type: notification_schema_1.NotificationType.WITHDRAWAL,
            meta: { amount, reason },
            sendEmail: true,
            emailAddress: email,
        });
    }
    async notifyProductApproved(sellerId, email, productName) {
        return this.create({
            user: sellerId,
            title: 'Product Approved! 🎉',
            message: `Your product "${productName}" is now live and available for promotion`,
            type: notification_schema_1.NotificationType.PRODUCT,
            meta: { productName },
            emailAddress: email,
        });
    }
    async notifyProductRejected(sellerId, email, productName, reason) {
        return this.create({
            user: sellerId,
            title: 'Product Rejected',
            message: `Your product "${productName}" was rejected: ${reason}`,
            type: notification_schema_1.NotificationType.PRODUCT,
            meta: { productName, reason },
            sendEmail: true,
            emailAddress: email,
        });
    }
    async notifyNewChatMessage(userId, senderName, preview) {
        return this.create({
            user: userId,
            title: `New message from ${senderName}`,
            message: preview.substring(0, 100),
            type: notification_schema_1.NotificationType.SYSTEM,
            meta: { senderName },
        });
    }
    async findByUser(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const filter = { user: new mongoose_2.Types.ObjectId(userId) };
        const unreadFilter = { user: new mongoose_2.Types.ObjectId(userId), isRead: false };
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
    async markAsRead(notificationId, userId) {
        const result = await this.notificationModel.findOneAndUpdate({ _id: notificationId, user: new mongoose_2.Types.ObjectId(userId) }, { isRead: true }, { new: true });
        const unreadCount = await this.notificationModel.countDocuments({
            user: new mongoose_2.Types.ObjectId(userId),
            isRead: false,
        });
        this.notificationsGateway.sendUnreadCount(userId, unreadCount);
        return result;
    }
    async markAllAsRead(userId) {
        await this.notificationModel.updateMany({ user: new mongoose_2.Types.ObjectId(userId), isRead: false }, { isRead: true });
        this.notificationsGateway.sendUnreadCount(userId, 0);
        return { message: 'All notifications marked as read' };
    }
    async getUnreadCount(userId) {
        const count = await this.notificationModel.countDocuments({
            user: new mongoose_2.Types.ObjectId(userId),
            isRead: false,
        });
        return { count };
    }
    buildNotificationEmail(title, message) {
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
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        notifications_gateway_1.NotificationsGateway,
        mail_service_1.MailService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map