import { ReferralsService } from './referrals.service';
import { GenerateReferralDto } from './dto/referral.dto';
export declare class ReferralsController {
    private referralsService;
    constructor(referralsService: ReferralsService);
    generate(userId: string, dto: GenerateReferralDto): Promise<(import("../../schemas/referral.schema").Referral & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    findMine(userId: string): Promise<(import("../../schemas/referral.schema").Referral & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    trackClick(code: string): Promise<{
        product: (import("../../schemas/product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
        referralCode: string;
        promoterId: import("mongoose").Types.ObjectId;
    }>;
    findByProduct(id: string): Promise<(import("../../schemas/referral.schema").Referral & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
