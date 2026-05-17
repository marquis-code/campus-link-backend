import type { Cache } from 'cache-manager';
import { Connection } from 'mongoose';
export declare class HealthController {
    private readonly mongooseConnection;
    private readonly cacheManager;
    constructor(mongooseConnection: Connection, cacheManager: Cache);
    getHealth(): Promise<{
        status: string;
        uptime: number;
        timestamp: string;
        services: {
            database: string;
            cache: string;
        };
    }>;
}
