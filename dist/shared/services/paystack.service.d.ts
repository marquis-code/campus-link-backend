import { ConfigService } from '@nestjs/config';
export declare class PaystackService {
    private configService;
    private readonly logger;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    private get headers();
    createCustomer(email: string, firstName: string, lastName: string, phone: string): Promise<any>;
    createVirtualAccount(customerCode: string): Promise<any>;
    verifyWebhook(signature: string, payload: any): Promise<boolean>;
}
