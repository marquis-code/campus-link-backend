import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class FirebaseService implements OnModuleInit {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    verifyIdToken(idToken: string): Promise<import("node_modules/firebase-admin/lib/auth/token-verifier").DecodedIdToken>;
}
