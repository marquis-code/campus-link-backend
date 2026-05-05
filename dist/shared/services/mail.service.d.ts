import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private resend;
    private readonly logger;
    constructor(configService: ConfigService);
    sendMail(to: string, subject: string, html: string): Promise<void>;
}
