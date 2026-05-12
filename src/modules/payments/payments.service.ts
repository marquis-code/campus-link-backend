import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../../schemas/order.schema';
import { Withdrawal, WithdrawalDocument, WithdrawalStatus } from '../../schemas/withdrawal.schema';
import { TransactionPurpose } from '../../schemas/transaction.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Withdrawal.name) private withdrawalModel: Model<WithdrawalDocument>,
    private notificationsService: NotificationsService,
    private mailService: MailService,
    private walletsService: WalletsService,
  ) {}

  async handleWebhook(event: string, data: any) {
    this.logger.log(`Handling Paystack Webhook: ${event}`);

    switch (event) {
      case 'charge.success':
        await this.handleChargeSuccess(data);
        break;
      case 'transfer.success':
        await this.handleTransferSuccess(data);
        break;
      case 'transfer.failed':
        await this.handleTransferFailed(data);
        break;
      case 'transfer.reversed':
        await this.handleTransferFailed(data);
        break;
      default:
        this.logger.warn(`Unhandled Paystack Event: ${event}`);
    }
  }

  private async handleChargeSuccess(data: any) {
    const { reference, amount, customer } = data;
    
    // Check if it's a wallet funding transaction
    if (reference && reference.startsWith('fund_')) {
      await this.walletsService.handleFundingWebhook({ data });
      return;
    }

    // Find order by reference (could be paymentReference or a separate field)
    // For DVA, reference might be the assignment integration or we look up by customer
    let order = await this.orderModel.findOne({ paymentReference: reference });
    
    if (!order) {
      // Fallback: look for pending orders for this customer email with matching amount
      order = await this.orderModel.findOne({
        buyerEmail: customer.email,
        totalPayable: amount / 100,
        status: OrderStatus.PENDING,
      }).sort('-createdAt');
    }

    if (!order) {
      this.logger.error(`Order not found for charge.success reference: ${reference}`);
      return;
    }

    if (order.status !== OrderStatus.PENDING) {
      this.logger.warn(`Order ${order._id} already processed. Status: ${order.status}`);
      return;
    }

    // Update order status
    order.status = OrderStatus.CONFIRMED;
    order.paidAt = new Date();
    await order.save();

    this.logger.log(`Order ${order._id} confirmed via Paystack charge.success`);

    // CREDIT WALLETS
    // 1. Credit Seller (Amount - Commission)
    const sellerRevenue = order.totalAmount - order.commissionAmount;
    await this.walletsService.creditWallet(
      order.seller.toString(),
      sellerRevenue,
      TransactionPurpose.PURCHASE,
      `order_s_${order._id}`,
      `Revenue for Order #${order._id.toString().slice(-6).toUpperCase()}`,
      { orderId: order._id }
    );

    // 2. Credit Ambassador (Commission)
    if (order.promoter && order.commissionAmount > 0) {
      await this.walletsService.creditWallet(
        order.promoter.toString(),
        order.commissionAmount,
        TransactionPurpose.EARNING,
        `order_a_${order._id}`,
        `Commission for Order #${order._id.toString().slice(-6).toUpperCase()}`,
        { orderId: order._id }
      );
    }

    // Notify Seller
    await this.notificationsService.notifyNewOrder(
      order.seller.toString(),
      '', // email handled by notifyNewOrder or we can pass it
      order._id.toString(),
      order.totalAmount
    );

    // Send confirmation to Buyer
    await this.mailService.sendMail(
      order.buyerEmail,
      'Payment Confirmed - Order Processing',
      `<h1>Payment Received!</h1><p>Your payment for <b>Order #${order._id.toString().slice(-6).toUpperCase()}</b> has been confirmed. The seller will contact you shortly for delivery.</p>`
    );
  }

  private async handleTransferSuccess(data: any) {
    const { reference } = data;
    const withdrawal = await this.withdrawalModel.findOne({ transferReference: reference });
    
    if (withdrawal) {
      withdrawal.status = WithdrawalStatus.COMPLETED;
      await withdrawal.save();
      this.logger.log(`Withdrawal ${withdrawal._id} marked as COMPLETED`);
      
      // Notify User
      await this.notificationsService.create({
        user: withdrawal.user.toString(),
        title: 'Payout Successful! 💰',
        message: `Your withdrawal of ₦${withdrawal.amount.toLocaleString()} has been settled to your bank account.`,
        type: 'payment',
      });
    }
  }

  private async handleTransferFailed(data: any) {
    const { reference } = data;
    const withdrawal = await this.withdrawalModel.findOne({ transferReference: reference });
    
    if (withdrawal) {
      withdrawal.status = WithdrawalStatus.FAILED;
      await withdrawal.save();
      this.logger.error(`Withdrawal ${withdrawal._id} marked as FAILED`);
      
      // Notify User
      await this.notificationsService.create({
        user: withdrawal.user.toString(),
        title: 'Payout Failed ❌',
        message: `Your withdrawal of ₦${withdrawal.amount.toLocaleString()} failed. The funds have been returned to your balance.`,
        type: 'payment',
      });
    }
  }
}
