import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wallet, WalletDocument } from '../../schemas/wallet.schema';
import {
  Transaction,
  TransactionDocument,
  TransactionType,
  TransactionPurpose,
  TransactionStatus,
} from '../../schemas/transaction.schema';
import { PaystackService } from '../../shared/services/paystack.service';

@Injectable()
export class WalletsService {
  private readonly logger = new Logger(WalletsService.name);

  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private paystackService: PaystackService,
  ) {}

  async getOrCreateWallet(userId: string): Promise<WalletDocument> {
    let wallet = await this.walletModel.findOne({
      user: new Types.ObjectId(userId),
    });
    if (!wallet) {
      wallet = await this.walletModel.create({
        user: new Types.ObjectId(userId),
        balance: 0,
      });
    }
    return wallet;
  }

  async getTransactions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.transactionModel
        .find({ user: new Types.ObjectId(userId) })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      this.transactionModel.countDocuments({
        user: new Types.ObjectId(userId),
      }),
    ]);

    return { transactions, total, page, pages: Math.ceil(total / limit) };
  }

  async creditWallet(
    userId: string,
    amount: number,
    purpose: TransactionPurpose,
    reference: string,
    description: string,
    metadata?: any,
  ) {
    const wallet = await this.getOrCreateWallet(userId);

    // Check if transaction with this reference already exists to avoid duplicates
    const existing = await this.transactionModel.findOne({ reference });
    if (existing && existing.status === TransactionStatus.SUCCESS) {
      return wallet;
    }

    const session = await this.walletModel.db.startSession();
    session.startTransaction();

    try {
      // Find if transaction with this reference already exists
      const transaction = await this.transactionModel.findOne({ reference });

      if (transaction) {
        if (transaction.status === TransactionStatus.SUCCESS) {
          await session.abortTransaction();
          return wallet;
        }
        // Update pending/failed transaction to success
        transaction.status = TransactionStatus.SUCCESS;
        transaction.amount = amount;
        transaction.description = description;
        transaction.metadata = { ...transaction.metadata, ...metadata };
        await transaction.save({ session });
      } else {
        // Create new transaction record
        await this.transactionModel.create(
          [
            {
              user: new Types.ObjectId(userId),
              wallet: wallet._id,
              amount,
              type: TransactionType.CREDIT,
              purpose,
              status: TransactionStatus.SUCCESS,
              reference,
              description,
              metadata,
            },
          ],
          { session },
        );
      }

      // Update balance
      wallet.balance += amount;
      await wallet.save({ session });

      await session.commitTransaction();
      return wallet;
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(
        `Failed to credit wallet for user ${userId}`,
        error.stack,
      );
      throw error;
    } finally {
      session.endSession();
    }
  }

  async debitWallet(
    userId: string,
    amount: number,
    purpose: TransactionPurpose,
    reference: string,
    description: string,
    metadata?: any,
  ) {
    const wallet = await this.getOrCreateWallet(userId);

    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const session = await this.walletModel.db.startSession();
    session.startTransaction();

    try {
      // Create transaction record
      await this.transactionModel.create(
        [
          {
            user: new Types.ObjectId(userId),
            wallet: wallet._id,
            amount,
            type: TransactionType.DEBIT,
            purpose,
            status: TransactionStatus.SUCCESS,
            reference,
            description,
            metadata,
          },
        ],
        { session },
      );

      // Update balance
      wallet.balance -= amount;
      await wallet.save({ session });

      await session.commitTransaction();
      return wallet;
    } catch (error) {
      await session.abortTransaction();
      this.logger.error(
        `Failed to debit wallet for user ${userId}`,
        error.stack,
      );
      throw error;
    } finally {
      session.endSession();
    }
  }

  async initializeFunding(
    userId: string,
    amount: number,
    email: string,
    callbackUrl?: string,
  ) {
    const reference = `fund_${userId}_${Date.now()}`;
    const wallet = await this.getOrCreateWallet(userId);

    // Initialize Paystack Transaction
    const payment = await this.paystackService.initializeTransaction(
      email,
      amount,
      reference,
      callbackUrl,
    );

    // Create a pending transaction record
    await this.transactionModel.create({
      user: new Types.ObjectId(userId),
      wallet: wallet._id,
      amount,
      type: TransactionType.CREDIT,
      purpose: TransactionPurpose.FUNDING,
      status: TransactionStatus.PENDING,
      reference: payment.reference,
      description: 'Wallet funding initialization',
      metadata: { callbackUrl },
    });

    return {
      reference: payment.reference,
      amount,
      email,
      checkoutUrl: payment.authorization_url,
    };
  }

  async handleFundingWebhook(payload: any) {
    const { reference, amount, customer } = payload.data;
    const transaction = await this.transactionModel.findOne({ reference });

    if (!transaction || transaction.status !== TransactionStatus.PENDING) {
      this.logger.warn(
        `Funding transaction not found or already processed: ${reference}`,
      );
      return;
    }

    await this.creditWallet(
      transaction.user.toString(),
      amount / 100, // Paystack amount is in kobo
      TransactionPurpose.FUNDING,
      reference,
      'Wallet funding confirmed',
    );
  }

  async syncEarnings(userId: string) {
    const userObjId = new Types.ObjectId(userId);
    let creditedCount = 0;
    let creditedAmount = 0;

    // 1. Sync Seller Earnings (Confirmed Orders)
    const OrderModel = this.walletModel.db.model('Order');
    const confirmedOrders = await OrderModel.find({
      seller: userObjId,
      status: 'confirmed',
    });

    for (const order of confirmedOrders) {
      const reference = `settle_${order._id}`;
      const amountToCredit = order.totalAmount - order.commissionAmount;

      const existing = await this.transactionModel.findOne({ reference });
      if (!existing) {
        await this.creditWallet(
          userId,
          amountToCredit,
          TransactionPurpose.ORDER_SETTLEMENT,
          reference,
          `Sync: Settlement for order #${order._id.toString().slice(-6).toUpperCase()}`,
        );
        creditedCount++;
        creditedAmount += amountToCredit;
      }
    }

    // 2. Sync Promoter Earnings (Available Earning records)
    const EarningModel = this.walletModel.db.model('Earning');
    const availableEarnings = await EarningModel.find({
      promoter: userObjId,
      status: 'available',
    });

    for (const earning of availableEarnings) {
      const reference = `order_a_${earning.order}`;
      const existing = await this.transactionModel.findOne({ reference });
      if (!existing) {
        await this.creditWallet(
          userId,
          earning.amount,
          TransactionPurpose.EARNING,
          reference,
          `Sync: Commission for order #${earning.order.toString().slice(-6).toUpperCase()}`,
        );
        creditedCount++;
        creditedAmount += earning.amount;
      }
    }

    return { success: true, creditedCount, creditedAmount };
  }
}
