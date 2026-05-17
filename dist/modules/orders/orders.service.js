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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("../../schemas/order.schema");
const product_schema_1 = require("../../schemas/product.schema");
const referral_schema_1 = require("../../schemas/referral.schema");
const earning_schema_1 = require("../../schemas/earning.schema");
const transaction_schema_1 = require("../../schemas/transaction.schema");
const notifications_service_1 = require("../notifications/notifications.service");
const mail_service_1 = require("../mail/mail.service");
const paystack_service_1 = require("../../shared/services/paystack.service");
const wallets_service_1 = require("../wallets/wallets.service");
let OrdersService = class OrdersService {
    orderModel;
    productModel;
    referralModel;
    earningModel;
    notificationsService;
    paystackService;
    mailService;
    walletsService;
    constructor(orderModel, productModel, referralModel, earningModel, notificationsService, paystackService, mailService, walletsService) {
        this.orderModel = orderModel;
        this.productModel = productModel;
        this.referralModel = referralModel;
        this.earningModel = earningModel;
        this.notificationsService = notificationsService;
        this.paystackService = paystackService;
        this.mailService = mailService;
        this.walletsService = walletsService;
    }
    async create(dto) {
        const product = await this.productModel.findById(dto.productId);
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.status !== 'active') {
            throw new common_1.BadRequestException('Product is not available');
        }
        const quantity = dto.quantity || 1;
        const totalAmount = product.price * quantity;
        let fee = 0;
        let totalPayable = totalAmount;
        if (totalAmount > 0) {
            const isAboveThreshold = totalAmount > 2500;
            const flatFee = isAboveThreshold ? 100 : 0;
            totalPayable = Math.ceil((totalAmount + flatFee) / (1 - 0.015));
            fee = totalPayable - totalAmount;
        }
        let promoterId;
        let referralId;
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
        });
        if (dto.buyerEmail) {
            try {
                const customer = await this.paystackService.createCustomer(dto.buyerEmail, dto.buyerName.split(' ')[0], dto.buyerName.split(' ')[1] || '', dto.buyerPhone);
                if (dto.paymentMethod === 'paystack') {
                    const payment = await this.paystackService.initializeTransaction(dto.buyerEmail, totalPayable, `order_${order._id}`, process.env.STUDENT_URL
                        ? `${process.env.STUDENT_URL}/orders/success`
                        : undefined);
                    await this.orderModel.findByIdAndUpdate(order._id, {
                        paymentReference: payment.reference,
                    });
                    return {
                        ...order.toObject(),
                        checkoutUrl: payment.authorization_url,
                    };
                }
                const dva = await this.paystackService.createVirtualAccount(customer.customer_code);
                await this.orderModel.findByIdAndUpdate(order._id, {
                    bankName: dva.bank.name,
                    accountNumber: dva.account_number,
                    accountName: dva.account_name,
                    paymentReference: dva.assignment.integration.toString(),
                });
                await this.mailService.sendMail(dto.buyerEmail, 'Order Received - Payment Details', `<h1>Hello ${dto.buyerName}</h1>
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
           <p>Your order will be processed as soon as payment is confirmed.</p>`);
            }
            catch (err) {
                console.error('Paystack integration failed', err);
            }
        }
        const populatedOrder = await order.populate('seller', 'name email');
        const seller = populatedOrder.seller;
        await this.notificationsService.notifyNewOrder(seller._id.toString(), seller.email, order._id.toString(), totalAmount);
        return this.orderModel
            .findById(order._id)
            .populate('product', 'name price images')
            .populate('seller', 'name email')
            .populate('promoter', 'name email')
            .lean();
    }
    async updateStatus(orderId, dto, user) {
        const order = await this.orderModel.findById(orderId);
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const isAdmin = user.role === 'admin';
        const isSeller = order.seller.toString() === user._id.toString();
        if (!isAdmin && !isSeller) {
            throw new common_1.ForbiddenException('You do not have permission to update this order');
        }
        const previousStatus = order.status;
        order.status = dto.status;
        if (dto.notes)
            order.notes = dto.notes;
        await order.save();
        if (dto.status === order_schema_1.OrderStatus.CONFIRMED &&
            previousStatus !== order_schema_1.OrderStatus.CONFIRMED) {
            const amountToCredit = order.totalAmount - order.commissionAmount;
            await this.walletsService.creditWallet(order.seller.toString(), amountToCredit, transaction_schema_1.TransactionPurpose.ORDER_SETTLEMENT, `settle_${order._id}`, `Settlement for order #${order._id.toString().slice(-8)}`);
            if (order.promoter && order.commissionAmount > 0) {
                await this.createEarning(order);
            }
        }
        if (dto.status === order_schema_1.OrderStatus.CANCELLED &&
            previousStatus === order_schema_1.OrderStatus.CONFIRMED &&
            order.promoter) {
            await this.earningModel.findOneAndUpdate({ order: order._id }, { status: 'pending' });
        }
        return this.orderModel
            .findById(orderId)
            .populate('product', 'name price images')
            .populate('seller', 'name email')
            .populate('promoter', 'name email')
            .lean();
    }
    async createEarning(order) {
        const existing = await this.earningModel.findOne({ order: order._id });
        if (existing)
            return;
        const earning = await this.earningModel.create({
            promoter: order.promoter,
            order: order._id,
            product: order.product,
            amount: order.commissionAmount,
            status: 'available',
        });
        await this.productModel.findByIdAndUpdate(order.product, {
            $inc: { totalSales: 1 },
        });
        if (order.referral) {
            await this.referralModel.findByIdAndUpdate(order.referral, {
                $inc: { orders: 1, earnings: order.commissionAmount },
            });
        }
        const populatedEarning = await earning.populate('promoter', 'name email');
        const promoter = populatedEarning.promoter;
        await this.walletsService.creditWallet(order.promoter.toString(), order.commissionAmount, transaction_schema_1.TransactionPurpose.EARNING, `order_a_${order._id}`, `Commission for Order #${order._id.toString().slice(-6).toUpperCase()}`, { orderId: order._id });
        await this.notificationsService.notifyEarning(promoter._id.toString(), promoter.email, order.commissionAmount, order.product.name || 'a product');
    }
    async findAll(query) {
        const { status, page = 1, limit = 20 } = query;
        const filter = {};
        if (status)
            filter.status = status;
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
    async findByBuyer(query) {
        return this.findAll(query);
    }
    async findBySeller(sellerId, query) {
        const { status, page = 1, limit = 20 } = query;
        const filter = { seller: new mongoose_2.Types.ObjectId(sellerId) };
        if (status)
            filter.status = status;
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
    async findByPromoter(promoterId, query) {
        const { status, page = 1, limit = 20 } = query;
        const filter = { promoter: new mongoose_2.Types.ObjectId(promoterId) };
        if (status)
            filter.status = status;
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
    async findOne(id) {
        const order = await this.orderModel
            .findById(id)
            .populate('product', 'name price images description commissionAmount')
            .populate('seller', 'name email phone')
            .populate('promoter', 'name email')
            .lean();
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(2, (0, mongoose_1.InjectModel)(referral_schema_1.Referral.name)),
    __param(3, (0, mongoose_1.InjectModel)(earning_schema_1.Earning.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        notifications_service_1.NotificationsService,
        paystack_service_1.PaystackService,
        mail_service_1.MailService,
        wallets_service_1.WalletsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map