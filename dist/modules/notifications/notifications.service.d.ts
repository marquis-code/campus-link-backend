import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from '../../schemas/notification.schema';
import { NotificationsGateway } from './notifications.gateway';
export declare class NotificationsService {
    private notificationModel;
    private readonly notificationsGateway;
    constructor(notificationModel: Model<NotificationDocument>, notificationsGateway: NotificationsGateway);
    findByUser(userId: string, page?: number, limit?: number): Promise<{
        notifications: (Notification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        unreadCount: number;
        page: number;
        pages: number;
    }>;
    markAsRead(notificationId: string, userId: string): Promise<(import("mongoose").Document<unknown, {}, NotificationDocument, {}, import("mongoose").DefaultSchemaOptions> & Notification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    markAllAsRead(userId: string): Promise<{
        message: string;
    }>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    create(data: {
        user: string | Types.ObjectId;
        title: string;
        message: string;
        type: string;
        meta?: Record<string, any>;
    }): Promise<import("mongoose").Document<unknown, {}, NotificationDocument, {}, import("mongoose").DefaultSchemaOptions> & Notification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
