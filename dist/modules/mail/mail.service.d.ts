import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private resend;
    private readonly logger;
    private readonly fromAddress;
    constructor(configService: ConfigService);
    sendMail(to: string, subject: string, html: string): Promise<import("resend").CreateEmailResponse | undefined>;
    sendWelcomeEmail(to: string, name: string): Promise<import("resend").CreateEmailResponse | undefined>;
    sendOrderConfirmation(to: string, orderRef: string, amount: number): Promise<import("resend").CreateEmailResponse | undefined>;
    sendWithdrawalProcessed(to: string, amount: number): Promise<import("resend").CreateEmailResponse | undefined>;
    sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<import("resend").CreateEmailResponse | undefined>;
}
