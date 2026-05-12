import { ConfigService } from '@nestjs/config';
export declare class PaystackService {
    private configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    private get headers();
    createCustomer(email: string, firstName: string, lastName: string, phone: string): Promise<any>;
    createVirtualAccount(customerCode: string): Promise<any>;
    initializeTransaction(email: string, amount: number, reference: string, callbackUrl?: string): Promise<any>;
    verifyTransaction(reference: string): Promise<any>;
    createTransferRecipient(name: string, accountNumber: string, bankCode: string): Promise<any>;
    initiateTransfer(amount: number, recipientCode: string, reference: string, reason?: string): Promise<any>;
    getBanks(): Promise<any>;
    resolveAccountNumber(accountNumber: string, bankCode: string): Promise<any>;
    verifySignature(signature: string, payload: any): boolean;
}
