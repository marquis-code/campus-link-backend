import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    findMine(userId: string, page: number, limit: number): Promise<{
        notifications: (import("../../schemas/notification.schema").Notification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        unreadCount: number;
        page: number;
        pages: number;
    }>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    markAsRead(id: string, userId: string): Promise<(import("mongoose").Document<unknown, {}, import("../../schemas/notification.schema").NotificationDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/notification.schema").Notification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    markAllAsRead(userId: string): Promise<{
        message: string;
    }>;
}
