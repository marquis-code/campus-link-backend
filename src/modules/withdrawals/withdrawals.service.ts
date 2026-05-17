import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Withdrawal,
  WithdrawalDocument,
  WithdrawalStatus,
} from '../../schemas/withdrawal.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { Order, OrderDocument } from '../../schemas/order.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { EarningsService } from '../earnings/earnings.service';
import { PaystackService } from '../../shared/services/paystack.service';
import { WalletsService } from '../wallets/wallets.service';
import {
  CreateWithdrawalDto,
  UpdateWithdrawalStatusDto,
} from './dto/withdrawal.dto';
import { TransactionPurpose } from '../../schemas/transaction.schema';

@Injectable()
export class WithdrawalsService {
  constructor(
    @InjectModel(Withdrawal.name)
    private withdrawalModel: Model<WithdrawalDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private notificationsService: NotificationsService,
    private earningsService: EarningsService,
    private paystackService: PaystackService,
    private walletsService: WalletsService,
  ) {}

  async create(userId: string, dto: CreateWithdrawalDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    const wallet = await this.walletsService.getOrCreateWallet(userId);
    if (wallet.balance < dto.amount) {
      throw new BadRequestException(
        `Insufficient balance. Available: ₦${wallet.balance.toLocaleString()}`,
      );
    }

    const pendingWithdrawal = await this.withdrawalModel.findOne({
      user: new Types.ObjectId(userId),
      status: WithdrawalStatus.PENDING,
    });
    if (pendingWithdrawal) {
      throw new BadRequestException(
        'You have a pending withdrawal request. Please wait for it to be processed.',
      );
    }

    const withdrawal = await this.withdrawalModel.create({
      user: new Types.ObjectId(userId),
      amount: dto.amount,
      bankName: dto.bankName || user?.bankName || '',
      bankAccountNumber: dto.bankAccountNumber || user?.bankAccountNumber || '',
      bankAccountName: dto.bankAccountName || user?.bankAccountName || '',
      bankCode: dto.bankCode || user?.bankCode || '',
    } as any);

    // Debit wallet immediately
    await this.walletsService.debitWallet(
      userId,
      dto.amount,
      TransactionPurpose.WITHDRAWAL,
      `wd_${withdrawal._id}`,
      `Withdrawal Request #${withdrawal._id.toString().slice(-6).toUpperCase()}`,
      { withdrawalId: withdrawal._id },
    );

    return withdrawal;
  }

  async findMyWithdrawals(userId: string) {
    return this.withdrawalModel
      .find({ user: new Types.ObjectId(userId) } as any)
      .sort('-createdAt')
      .lean();
  }

  async findAll(page = 1, limit = 20, status?: string) {
    const filter: any = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      this.withdrawalModel
        .find(filter)
        .populate('user', 'name email phone')
        .populate('processedBy', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      this.withdrawalModel.countDocuments(filter),
    ]);

    return { withdrawals, total, page, pages: Math.ceil(total / limit) };
  }

  async updateStatus(
    withdrawalId: string,
    dto: UpdateWithdrawalStatusDto,
    adminId: string,
  ) {
    const withdrawal = await this.withdrawalModel.findById(withdrawalId);
    if (!withdrawal) throw new NotFoundException('Withdrawal not found');

    (withdrawal as any).status = dto.status;
    if (dto.adminNote) withdrawal.adminNote = dto.adminNote;
    withdrawal.processedBy = new Types.ObjectId(adminId);
    withdrawal.processedAt = new Date();

    // Automated Payout Logic
    if (dto.status === 'approved') {
      try {
        // 1. Create/Verify Transfer Recipient
        const recipient = await this.paystackService.createTransferRecipient(
          withdrawal.bankAccountName,
          withdrawal.bankAccountNumber,
          withdrawal.bankCode,
        );
        (withdrawal as any).recipientCode = recipient.recipient_code;

        // 2. Initiate Transfer
        const transferRef = `wd_${withdrawal._id}_${Date.now()}`;
        const transfer = await this.paystackService.initiateTransfer(
          withdrawal.amount,
          recipient.recipient_code,
          transferRef,
          `CampusLink Payout: ${withdrawal.bankAccountName}`,
        );

        (withdrawal as any).transferReference = transferRef;
        (withdrawal as any).status = WithdrawalStatus.PROCESSING;
      } catch (err) {
        console.error(
          'Paystack Transfer failed:',
          err.response?.data || err.message,
        );
        // If automated payout fails, we keep status as approved but don't move to processing
        // Admin might need to handle manually or retry
      }
    }

    await withdrawal.save();

    if (dto.status === 'approved' || dto.status === 'completed') {
      await this.earningsService.markEarningsAsPaid(
        withdrawal.user.toString(),
        withdrawal.amount,
      );
    } else if (dto.status === 'rejected') {
      // Refund wallet
      await this.walletsService.creditWallet(
        withdrawal.user.toString(),
        withdrawal.amount,
        TransactionPurpose.REFUND,
        `wd_reject_${withdrawal._id}`,
        `Refund for Rejected Withdrawal #${withdrawal._id.toString().slice(-6).toUpperCase()}`,
        { withdrawalId: withdrawal._id },
      );
    }

    const populatedWithdrawal = await withdrawal.populate('user', 'name email');
    const user = populatedWithdrawal.user as any;

    if (dto.status === 'approved' || dto.status === 'completed') {
      await this.notificationsService.notifyWithdrawalApproved(
        user._id.toString(),
        user.email,
        withdrawal.amount,
      );
    } else if (dto.status === 'rejected') {
      await this.notificationsService.notifyWithdrawalRejected(
        user._id.toString(),
        user.email,
        withdrawal.amount,
        dto.adminNote || 'No reason provided',
      );
    }

    return withdrawal;
  }
}
