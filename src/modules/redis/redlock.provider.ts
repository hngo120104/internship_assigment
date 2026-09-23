import type { Provider } from '@nestjs/common';
import type Redis from 'ioredis';
import Redlock from 'redlock';
import { REDIS_CLIENT, REDLOCK_CLIENT } from './constants/redis.constants';

export const RedlockProvider: Provider = {
  provide: REDLOCK_CLIENT,
  useFactory: (redisClient: Redis): Redlock => {
    return new Redlock([redisClient], {
      retryCount: 5,
      retryDelay: 200,
      retryJitter: 100,
      automaticExtensionThreshold: 500,
    });
  },
  inject: [REDIS_CLIENT],
};
