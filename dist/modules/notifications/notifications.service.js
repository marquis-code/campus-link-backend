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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_schema_1 = require("../../schemas/notification.schema");
const notifications_gateway_1 = require("./notifications.gateway");
let NotificationsService = class NotificationsService {
    notificationModel;
    notificationsGateway;
    constructor(notificationModel, notificationsGateway) {
        this.notificationModel = notificationModel;
        this.notificationsGateway = notificationsGateway;
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
        return this.notificationModel.findOneAndUpdate({ _id: notificationId, user: new mongoose_2.Types.ObjectId(userId) }, { isRead: true }, { new: true });
    }
    async markAllAsRead(userId) {
        await this.notificationModel.updateMany({ user: new mongoose_2.Types.ObjectId(userId), isRead: false }, { isRead: true });
        return { message: 'All notifications marked as read' };
    }
    async getUnreadCount(userId) {
        const count = await this.notificationModel.countDocuments({
            user: new mongoose_2.Types.ObjectId(userId),
            isRead: false,
        });
        return { count };
    }
    async create(data) {
        const notification = await this.notificationModel.create({
            ...data,
            user: typeof data.user === 'string' ? new mongoose_2.Types.ObjectId(data.user) : data.user,
        });
        this.notificationsGateway.sendNotification(data.user.toString(), notification);
        return notification;
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        notifications_gateway_1.NotificationsGateway])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map