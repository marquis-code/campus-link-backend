import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Withdrawal, WithdrawalDocument, WithdrawalStatus } from '../../schemas/withdrawal.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { Notification, NotificationDocument, NotificationType } from '../../schemas/notification.schema';
import { EarningsService } from '../earnings/earnings.service';
import { CreateWithdrawalDto, UpdateWithdrawalStatusDto } from './dto/withdrawal.dto';

@Injectable()
export class WithdrawalsService {
  constructor(
    @InjectModel(Withdrawal.name) private withdrawalModel: Model<WithdrawalDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private earningsService: EarningsService,
  ) {}

  async create(userId: string, dto: CreateWithdrawalDto) {
    const summary = await this.earningsService.getEarningsSummary(userId);
    if (summary.availableEarnings < dto.amount) {
      throw new BadRequestException(
        `Insufficient balance. Available: ₦${summary.availableEarnings}`,
      );
    }

    const pendingWithdrawal = await this.withdrawalModel.findOne({
      user: new Types.ObjectId(userId),
      status: WithdrawalStatus.PENDING,
    } as any);
    if (pendingWithdrawal) {
      throw new BadRequestException(
        'You have a pending withdrawal request. Please wait for it to be processed.',
      );
    }

    const user = await this.userModel.findById(userId);

    const withdrawal = await this.withdrawalModel.create({
      user: new Types.ObjectId(userId),
      amount: dto.amount,
      bankName: dto.bankName || user?.bankName || '',
      bankAccountNumber: dto.bankAccountNumber || user?.bankAccountNumber || '',
      bankAccountName: dto.bankAccountName || user?.bankAccountName || '',
    } as any);

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
    await withdrawal.save();

    if (dto.status === 'approved' || dto.status === 'completed') {
      await this.earningsService.markEarningsAsPaid(
        withdrawal.user.toString(),
        withdrawal.amount,
      );
    }

    const statusMessages: Record<string, string> = {
      approved: 'Your withdrawal request has been approved! 🎉',
      rejected: `Your withdrawal request was rejected. ${dto.adminNote || ''}`,
      processing: 'Your withdrawal is being processed.',
      completed: 'Your withdrawal has been completed! Check your bank account.',
    };

    await this.notificationModel.create({
      user: withdrawal.user,
      title: 'Withdrawal Update',
      message: statusMessages[dto.status] || 'Withdrawal status updated',
      type: NotificationType.WITHDRAWAL,
      meta: { withdrawalId: withdrawal._id, status: dto.status },
    } as any);

    return withdrawal;
  }
}
