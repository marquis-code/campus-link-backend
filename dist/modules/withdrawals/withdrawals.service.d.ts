import { Model, Types } from 'mongoose';
import { Withdrawal, WithdrawalDocument } from '../../schemas/withdrawal.schema';
import { UserDocument } from '../../schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { EarningsService } from '../earnings/earnings.service';
import { CreateWithdrawalDto, UpdateWithdrawalStatusDto } from './dto/withdrawal.dto';
export declare class WithdrawalsService {
    private withdrawalModel;
    private userModel;
    private notificationsService;
    private earningsService;
    constructor(withdrawalModel: Model<WithdrawalDocument>, userModel: Model<UserDocument>, notificationsService: NotificationsService, earningsService: EarningsService);
    create(userId: string, dto: CreateWithdrawalDto): Promise<import("mongoose").Document<unknown, {}, WithdrawalDocument, {}, import("mongoose").DefaultSchemaOptions> & Withdrawal & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findMyWithdrawals(userId: string): Promise<(Withdrawal & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findAll(page?: number, limit?: number, status?: string): Promise<{
        withdrawals: (Withdrawal & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    updateStatus(withdrawalId: string, dto: UpdateWithdrawalStatusDto, adminId: string): Promise<import("mongoose").Document<unknown, {}, WithdrawalDocument, {}, import("mongoose").DefaultSchemaOptions> & Withdrawal & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
