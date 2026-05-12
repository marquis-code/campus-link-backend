import { PaymentsService } from './payments.service';
import { PaystackService } from '../../shared/services/paystack.service';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly paystackService;
    constructor(paymentsService: PaymentsService, paystackService: PaystackService);
    handleWebhook(signature: string, payload: any): Promise<{
        status: string;
    }>;
    getBanks(): Promise<any>;
    resolveAccount(accountNumber: string, bankCode: string): Promise<any>;
    verifyPayment(reference: string): Promise<any>;
}
