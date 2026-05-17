import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../../schemas/order.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Referral, ReferralDocument } from '../../schemas/referral.schema';
import { Earning, EarningDocument } from '../../schemas/earning.schema';
import { TransactionPurpose } from '../../schemas/transaction.schema';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderQueryDto,
} from './dto/order.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { PaystackService } from '../../shared/services/paystack.service';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Referral.name) private referralModel: Model<ReferralDocument>,
    @InjectModel(Earning.name) private earningModel: Model<EarningDocument>,
    private notificationsService: NotificationsService,
    private paystackService: PaystackService,
    private mailService: MailService,
    private walletsService: WalletsService,
  ) {}

  async create(dto: CreateOrderDto) {
    const product = await this.productModel.findById(dto.productId);
    if (!product) throw new NotFoundException('Product not found');
    if (product.status !== 'active') {
      throw new BadRequestException('Product is not available');
    }

    const quantity = dto.quantity || 1;
    const totalAmount = product.price * quantity;

    // Calculate Paystack charge (customer bears it)
    // Paystack fee: 1.5% + (N100 if > N2500)
    // Formula to ensure merchant receives totalAmount:
    // P = (M + 100) / 0.985
    let fee = 0;
    let totalPayable = totalAmount;

    if (totalAmount > 0) {
      const isAboveThreshold = totalAmount > 2500;
      const flatFee = isAboveThreshold ? 100 : 0;
      totalPayable = Math.ceil((totalAmount + flatFee) / (1 - 0.015));
      fee = totalPayable - totalAmount;
    }

    let promoterId: Types.ObjectId | undefined;
    let referralId: Types.ObjectId | undefined;

    // Check referral code
    if (dto.referralCode) {
      const referral = await this.referralModel.findOne({
        referralCode: dto.referralCode,
      });
      if (referral) {
        promoterId = referral.promoter;
        referralId = referral._id;
      }
    }

    const order = await this.orderModel.create({
      product: product._id,
      seller: product.seller,
      promoter: promoterId,
      referral: referralId,
      buyerName: dto.buyerName,
      buyerPhone: dto.buyerPhone,
      buyerEmail: dto.buyerEmail,
      quantity,
      totalAmount,
      fee,
      totalPayable,
      commissionAmount: promoterId ? product.commissionAmount * quantity : 0,
      notes: dto.notes,
    } as any);

    // Create Paystack integration if email is provided
    if (dto.buyerEmail) {
      try {
        const customer = await this.paystackService.createCustomer(
          dto.buyerEmail,
          dto.buyerName.split(' ')[0],
          dto.buyerName.split(' ')[1] || '',
          dto.buyerPhone,
        );

        if (dto.paymentMethod === 'paystack') {
          // Initialize Paystack Card Payment
          const payment = await this.paystackService.initializeTransaction(
            dto.buyerEmail,
            totalPayable,
            `order_${order._id}`,
            process.env.STUDENT_URL
              ? `${process.env.STUDENT_URL}/orders/success`
              : undefined,
          );

          await this.orderModel.findByIdAndUpdate(order._id, {
            paymentReference: payment.reference,
          });

          return {
            ...order.toObject(),
            checkoutUrl: payment.authorization_url,
          };
        }

        // Default: Create DVA for Bank Transfer
        const dva = await this.paystackService.createVirtualAccount(
          customer.customer_code,
        );

        await this.orderModel.findByIdAndUpdate(order._id, {
          bankName: dva.bank.name,
          accountNumber: dva.account_number,
          accountName: dva.account_name,
          paymentReference: dva.assignment.integration.toString(),
        });

        // Send email with bank details
        await this.mailService.sendMail(
          dto.buyerEmail,
          'Order Received - Payment Details',
          `<h1>Hello ${dto.buyerName}</h1>
           <p>Thank you for your order of <b>${product.name}</b>.</p>
           <p>Please make a bank transfer of <b>₦${totalPayable.toLocaleString()}</b> to the following account:</p>
           <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0;">
             <p style="margin: 0; font-size: 12px; color: #6b7280;">Bank Details</p>
             <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #111827;">${dva.bank.name}</p>
             <p style="margin: 5px 0; font-size: 24px; font-weight: 800; color: #4f46e5; letter-spacing: 1px;">${dva.account_number}</p>
             <p style="margin: 5px 0; font-size: 14px; font-weight: 600; color: #374151;">${dva.account_name}</p>
           </div>
           <p style="font-size: 13px; color: #6b7280;">Payment Breakdown:</p>
           <ul style="font-size: 13px; color: #374151;">
             <li>Product Price: ₦${totalAmount.toLocaleString()}</li>
             <li>Transfer Charge: ₦${fee.toLocaleString()}</li>
             <li><b>Total Payable: ₦${totalPayable.toLocaleString()}</b></li>
           </ul>
           <p>Your order will be processed as soon as payment is confirmed.</p>`,
        );
      } catch (err) {
        console.error('Paystack integration failed', err);
      }
    }

    // Populate seller for notification
    const populatedOrder = await order.populate('seller', 'name email');
    const seller = populatedOrder.seller as any;

    // Notify seller about new order
    await this.notificationsService.notifyNewOrder(
      seller._id.toString(),
      seller.email,
      order._id.toString(),
      totalAmount,
    );

    return this.orderModel
      .findById(order._id)
      .populate('product', 'name price images')
      .populate('seller', 'name email')
      .populate('promoter', 'name email')
      .lean();
  }

  async updateStatus(orderId: string, dto: UpdateOrderStatusDto, user: any) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    // Ownership check: only the seller or an admin can update order status
    const isAdmin = user.role === 'admin';
    const isSeller = order.seller.toString() === user._id.toString();

    if (!isAdmin && !isSeller) {
      throw new ForbiddenException(
        'You do not have permission to update this order',
      );
    }

    const previousStatus = order.status;
    order.status = dto.status;
    if (dto.notes) order.notes = dto.notes;
    await order.save();

    // When order is confirmed and there's a promoter → create earnings
    if (
      dto.status === OrderStatus.CONFIRMED &&
      previousStatus !== OrderStatus.CONFIRMED
    ) {
      // Credit seller's wallet: amount = totalAmount - commissionAmount
      const amountToCredit = order.totalAmount - order.commissionAmount;
      await this.walletsService.creditWallet(
        order.seller.toString(),
        amountToCredit,
        TransactionPurpose.ORDER_SETTLEMENT,
        `settle_${order._id}`,
        `Settlement for order #${order._id.toString().slice(-8)}`,
      );

      // Create earnings for promoter if applicable
      if (order.promoter && order.commissionAmount > 0) {
        await this.createEarning(order);
      }
    }

    // When order is cancelled and was previously confirmed → handle earnings
    if (
      dto.status === OrderStatus.CANCELLED &&
      previousStatus === OrderStatus.CONFIRMED &&
      order.promoter
    ) {
      await this.earningModel.findOneAndUpdate(
        { order: order._id },
        { status: 'pending' },
      );
    }

    return this.orderModel
      .findById(orderId)
      .populate('product', 'name price images')
      .populate('seller', 'name email')
      .populate('promoter', 'name email')
      .lean();
  }

  private async createEarning(order: OrderDocument) {
    // Check if earning already exists for this order
    const existing = await this.earningModel.findOne({ order: order._id });
    if (existing) return;

    const earning = await this.earningModel.create({
      promoter: order.promoter,
      order: order._id,
      product: order.product,
      amount: order.commissionAmount,
      status: 'available',
    } as any);

    // Update product sales count
    await this.productModel.findByIdAndUpdate(order.product, {
      $inc: { totalSales: 1 },
    });

    // Update referral order count and earnings
    if (order.referral) {
      await this.referralModel.findByIdAndUpdate(order.referral, {
        $inc: { orders: 1, earnings: order.commissionAmount },
      });
    }

    // Notify promoter about earning
    const populatedEarning = await earning.populate('promoter', 'name email');
    const promoter = populatedEarning.promoter as any;

    // Credit promoter's wallet
    await this.walletsService.creditWallet(
      order.promoter.toString(),
      order.commissionAmount,
      TransactionPurpose.EARNING,
      `order_a_${order._id}`,
      `Commission for Order #${order._id.toString().slice(-6).toUpperCase()}`,
      { orderId: order._id },
    );

    await this.notificationsService.notifyEarning(
      promoter._id.toString(),
      promoter.email,
      order.commissionAmount,
      (order.product as any).name || 'a product',
    );
  }

  async findAll(query: OrderQueryDto) {
    const { status, page = 1, limit = 20 } = query;
    const filter: any = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('product', 'name price images')
        .populate('seller', 'name email')
        .populate('promoter', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      this.orderModel.countDocuments(filter),
    ]);

    return { orders, total, page, pages: Math.ceil(total / limit) };
  }

  async findByBuyer(query: OrderQueryDto) {
    return this.findAll(query);
  }

  async findBySeller(sellerId: string, query: OrderQueryDto) {
    const { status, page = 1, limit = 20 } = query;
    const filter: any = { seller: new Types.ObjectId(sellerId) };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('product', 'name price images')
        .populate('promoter', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      this.orderModel.countDocuments(filter),
    ]);

    return { orders, total, page, pages: Math.ceil(total / limit) };
  }

  async findByPromoter(promoterId: string, query: OrderQueryDto) {
    const { status, page = 1, limit = 20 } = query;
    const filter: any = { promoter: new Types.ObjectId(promoterId) };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('product', 'name price images commissionAmount')
        .populate('seller', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      this.orderModel.countDocuments(filter),
    ]);

    return { orders, total, page, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const order = await this.orderModel
      .findById(id)
      .populate('product', 'name price images description commissionAmount')
      .populate('seller', 'name email phone')
      .populate('promoter', 'name email')
      .lean();

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
