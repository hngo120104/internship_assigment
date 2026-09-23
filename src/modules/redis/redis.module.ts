import { Module, OnApplicationShutdown } from '@nestjs/common';
import { RedisLockService } from './services/redis-lock.service';
import Redis from 'ioredis';
import { REDIS_CLIENT, REDLOCK_CLIENT } from './constants/redis.constants';
import { RedlockProvider } from './redlock.provider';
import { RedlockService } from './services/redlock.service';

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT) || 6379,
          // password: 'your_secure_password',
        });
      },
    },
    RedlockProvider,
    RedlockService,
    RedisLockService,
  ],
  exports: [REDIS_CLIENT, REDLOCK_CLIENT, RedlockService, RedisLockService],
})
export class RedisModule implements OnApplicationShutdown {
  constructor() {}

  onApplicationShutdown() {}
}
