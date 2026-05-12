import { OrderStatus } from '../../../schemas/order.schema';
export declare class CreateOrderDto {
    productId: string;
    buyerName: string;
    buyerPhone: string;
    buyerEmail?: string;
    quantity?: number;
    referralCode?: string;
    notes?: string;
    paymentMethod?: string;
}
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
    notes?: string;
}
export declare class OrderQueryDto {
    status?: string;
    page?: number;
    limit?: number;
}
