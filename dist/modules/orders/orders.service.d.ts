import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { ProductDocument } from '../../schemas/product.schema';
import { ReferralDocument } from '../../schemas/referral.schema';
import { EarningDocument } from '../../schemas/earning.schema';
import { NotificationDocument } from '../../schemas/notification.schema';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/order.dto';
import { MailService } from '../mail/mail.service';
import { PaystackService } from '../../shared/services/paystack.service';
export declare class OrdersService {
    private orderModel;
    private productModel;
    private referralModel;
    private earningModel;
    private notificationModel;
    private paystackService;
    private mailService;
    constructor(orderModel: Model<OrderDocument>, productModel: Model<ProductDocument>, referralModel: Model<ReferralDocument>, earningModel: Model<EarningDocument>, notificationModel: Model<NotificationDocument>, paystackService: PaystackService, mailService: MailService);
    create(dto: CreateOrderDto): Promise<(Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updateStatus(orderId: string, dto: UpdateOrderStatusDto, userId: string): Promise<(Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    private createEarning;
    findAll(query: OrderQueryDto): Promise<{
        orders: (Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    findByBuyer(query: OrderQueryDto): Promise<{
        orders: (Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    findBySeller(sellerId: string, query: OrderQueryDto): Promise<{
        orders: (Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    findByPromoter(promoterId: string, query: OrderQueryDto): Promise<{
        orders: (Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
