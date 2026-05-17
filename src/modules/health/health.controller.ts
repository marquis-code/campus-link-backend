import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly mongooseConnection: Connection,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Get()
  async getHealth() {
    const errors: string[] = [];

    // Check MongoDB Connection State
    // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const dbState = this.mongooseConnection.readyState;
    let dbStatus = 'disconnected';
    if (dbState === (1 as any)) {
      dbStatus = 'connected';
    } else {
      dbStatus = 'unhealthy';
      errors.push(`Database connection state: ${dbState}`);
    }

    // Check Redis / Cache Connection
    let redisStatus = 'unknown';
    try {
      // Simple transient write/read test to ensure store works
      await this.cacheManager.set('health-check-key', 'ok');
      const val = await this.cacheManager.get('health-check-key');
      if (val === 'ok') {
        redisStatus = 'healthy';
      } else {
        redisStatus = 'degraded';
        errors.push('Cache write-read mismatch');
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      redisStatus = 'unhealthy';
      errors.push(`Cache check failed: ${errorMessage}`);
    }

    const payload = {
      status: errors.length === 0 ? 'healthy' : 'unhealthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        cache: redisStatus,
      },
    };

    if (errors.length > 0) {
      throw new ServiceUnavailableException({
        ...payload,
        errors,
      });
    }

    return payload;
  }
}
