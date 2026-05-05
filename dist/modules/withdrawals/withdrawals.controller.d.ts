import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto, UpdateWithdrawalStatusDto } from './dto/withdrawal.dto';
export declare class WithdrawalsController {
    private withdrawalsService;
    constructor(withdrawalsService: WithdrawalsService);
    create(userId: string, dto: CreateWithdrawalDto): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/withdrawal.schema").WithdrawalDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/withdrawal.schema").Withdrawal & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findMine(userId: string): Promise<(import("../../schemas/withdrawal.schema").Withdrawal & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findAll(page: number, limit: number, status: string): Promise<{
        withdrawals: (import("../../schemas/withdrawal.schema").Withdrawal & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        pages: number;
    }>;
    updateStatus(id: string, adminId: string, dto: UpdateWithdrawalStatusDto): Promise<import("mongoose").Document<unknown, {}, import("../../schemas/withdrawal.schema").WithdrawalDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../../schemas/withdrawal.schema").Withdrawal & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
