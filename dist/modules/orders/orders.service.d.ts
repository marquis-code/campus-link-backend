import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../../schemas/order.schema';
import { ProductDocument } from '../../schemas/product.schema';
import { ReferralDocument } from '../../schemas/referral.schema';
import { EarningDocument } from '../../schemas/earning.schema';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/order.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { PaystackService } from '../../shared/services/paystack.service';
import { WalletsService } from '../wallets/wallets.service';
export declare class OrdersService {
    private orderModel;
    private productModel;
    private referralModel;
    private earningModel;
    private notificationsService;
    private paystackService;
    private mailService;
    private walletsService;
    constructor(orderModel: Model<OrderDocument>, productModel: Model<ProductDocument>, referralModel: Model<ReferralDocument>, earningModel: Model<EarningDocument>, notificationsService: NotificationsService, paystackService: PaystackService, mailService: MailService, walletsService: WalletsService);
    create(dto: CreateOrderDto): Promise<(Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | {
        checkoutUrl: any;
        product: Types.ObjectId;
        seller: Types.ObjectId;
        promoter: Types.ObjectId;
        referral: Types.ObjectId;
        buyerName: string;
        buyerPhone: string;
        buyerEmail: string;
        quantity: number;
        totalAmount: number;
        commissionAmount: number;
        fee: number;
        totalPayable: number;
        status: OrderStatus;
        paymentStatus: import("../../schemas/order.schema").PaymentStatus;
        bankName: string;
        accountNumber: string;
        accountName: string;
        paymentReference: string;
        paidAt: Date;
        notes: string;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    } | null>;
    updateStatus(orderId: string, dto: UpdateOrderStatusDto, user: any): Promise<(Order & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
