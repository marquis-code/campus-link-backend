import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { CampusesModule } from './modules/campuses/campuses.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { OrdersModule } from './modules/orders/orders.module';
import { EarningsModule } from './modules/earnings/earnings.module';
import { WithdrawalsModule } from './modules/withdrawals/withdrawals.module';
import { AiModule } from './modules/ai/ai.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { UploadModule } from './modules/upload/upload.module';
import { ChatModule } from './modules/chat/chat.module';
import { MailModule } from './modules/mail/mail.module';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { SeedModule } from './common/services/seed.module';

import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-yet';
import { SharedModule } from './shared/services/shared.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { WalletsModule } from './modules/wallets/wallets.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL');
        
        if (!redisUrl || redisUrl === 'memory') {
          console.log('Using in-memory cache');
          return { ttl: 600 };
        }

        try {
          const store = await redisStore.redisStore({
            url: redisUrl,
            socket: {
              connectTimeout: 5000,
              reconnectStrategy: (retries) => {
                if (retries > 5) {
                  console.warn('Redis reconnection failed too many times. Continuing with broken cache.');
                  return false;
                }
                return Math.min(retries * 100, 3000);
              }
            }
          });

          // Aggressively catch client errors to prevent process crash
          if (store.client) {
            store.client.on('error', (err: any) => {
              console.error('Redis Client Error (Non-Fatal):', err.message);
            });
          }

          return { store };
        } catch (e) {
          console.error('Failed to connect to Redis, falling back to memory cache:', e.message);
          return { ttl: 600 };
        }
      },
      inject: [ConfigService],
    }),
    SharedModule,
    AuthModule,
    CampusesModule,
    CategoriesModule,
    ProductsModule,
    ReferralsModule,
    OrdersModule,
    EarningsModule,
    WithdrawalsModule,
    AiModule,
    NotificationsModule,
    AdminModule,
    UploadModule,
    ChatModule,
    MailModule,
    FirebaseModule,
    SeedModule,
    PaymentsModule,
    WalletsModule,
  ],
})
export class AppModule {}
