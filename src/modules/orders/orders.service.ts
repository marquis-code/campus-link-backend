import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../../schemas/order.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Referral, ReferralDocument } from '../../schemas/referral.schema';
import { Earning, EarningDocument } from '../../schemas/earning.schema';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/order.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { PaystackService } from '../../shared/services/paystack.service';

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
  ) {}

  async create(dto: CreateOrderDto) {
    const product = await this.productModel.findById(dto.productId);
    if (!product) throw new NotFoundException('Product not found');
    if (product.status !== 'active') {
      throw new BadRequestException('Product is not available');
    }

    const quantity = dto.quantity || 1;
    const totalAmount = product.price * quantity;

    let promoterId: Types.ObjectId | undefined;
    let referralId: Types.ObjectId | undefined;

    // Check referral code
    if (dto.referralCode) {
      const referral = await this.referralModel.findOne({
        referralCode: dto.referralCode,
      });
      if (referral) {
        promoterId = referral.promoter as Types.ObjectId;
        referralId = referral._id as Types.ObjectId;
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
      commissionAmount: promoterId ? product.commissionAmount * quantity : 0,
      notes: dto.notes,
    } as any);

    // Create Paystack Virtual Account if email is provided
    if (dto.buyerEmail) {
      try {
        const customer = await this.paystackService.createCustomer(
          dto.buyerEmail,
          dto.buyerName.split(' ')[0],
          dto.buyerName.split(' ')[1] || '',
          dto.buyerPhone,
        );
        const dva = await this.paystackService.createVirtualAccount(customer.customer_code);
        
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
           <p>Please make a bank transfer of <b>₦${totalAmount.toLocaleString()}</b> to the following account:</p>
           <ul>
             <li><b>Bank:</b> ${dva.bank.name}</li>
             <li><b>Account Number:</b> ${dva.account_number}</li>
             <li><b>Account Name:</b> ${dva.account_name}</li>
           </ul>
           <p>Your order will be processed as soon as payment is confirmed.</p>`
        );
      } catch (err) {
        console.error('Paystack DVA creation failed', err);
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
      totalAmount
    );

    // Notify promoter if applicable
    if (promoterId) {
      const promoter = await this.orderModel.findById(order._id).populate('promoter', 'name email');
      if (promoter && promoter.promoter) {
        await this.notificationsService.create({
          user: promoterId.toString(),
          title: 'Someone ordered through your link! 🚀',
          message: `Your referral for ${product.name} just got an order`,
          type: 'order',
          emailAddress: (promoter.promoter as any).email,
        });
      }
    }

    return this.orderModel
      .findById(order._id)
      .populate('product', 'name price images')
      .populate('seller', 'name email')
      .populate('promoter', 'name email')
      .lean();
  }

  async updateStatus(orderId: string, dto: UpdateOrderStatusDto, userId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    const previousStatus = order.status;
    order.status = dto.status;
    if (dto.notes) order.notes = dto.notes;
    await order.save();

    // When order is confirmed and there's a promoter → create earnings
    if (
      dto.status === OrderStatus.CONFIRMED &&
      previousStatus !== OrderStatus.CONFIRMED &&
      order.promoter &&
      order.commissionAmount > 0
    ) {
      await this.createEarning(order);
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
    
    await this.notificationsService.notifyEarning(
      promoter._id.toString(),
      promoter.email,
      order.commissionAmount,
      (order.product as any).name || 'a product'
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
