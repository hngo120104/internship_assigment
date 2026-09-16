import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import { ResourceLock } from '../interfaces/resource-lock.interface';
import { REDIS_CLIENT } from '../redis.constants';

@Injectable()
export class RedisLockService {
  private readonly luaReleasScript = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then 
      return redis.call("DEL", KEYS[1])
    else 
      return 0
    end
  `;
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async acquireLock(resource: string, ttlMs: number): Promise<string | null> {
    const ownershipToken = randomUUID();

    const result = await this.redis.set(
      resource,
      ownershipToken,
      'PX',
      ttlMs,
      'NX',
    );

    return result === 'OK' ? ownershipToken : null;
  }

  async releaseLock(resource: string, token: string): Promise<boolean> {
    const result = await this.redis.eval(
      this.luaReleasScript,
      1,
      resource,
      token,
    );

    return result === 1;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async acquireWithRetry(
    resource: string,
    ttlMs: number = 2000,
    maxRetry: number = 5,
    baseDelayMs: number = 50,
    maxDelayMs: number = 500,
  ) {
    let token: string | null;
    for (let attempt = 1; attempt <= maxRetry; attempt++) {
      token = await this.acquireLock(resource, ttlMs);

      if (token) return token;

      if (attempt < maxRetry) {
        const exponentialCeiling = Math.min(
          maxDelayMs,
          Math.pow(2, attempt) * baseDelayMs,
        );
        const jitteredDelay = Math.floor(Math.random() * exponentialCeiling);
        await this.sleep(jitteredDelay);
      }
    }
    return null;
  }

  async acquireAllLocks(resources: string[]): Promise<ResourceLock[] | null> {
    const resourceLocks: ResourceLock[] = [];
    const sortedResource = resources.sort();
    for (const resource of sortedResource) {
      const token = await this.acquireWithRetry(resource);

      if (!token) {
        for (const lock of resourceLocks.reverse()) {
          await this.releaseLock(lock.resource, lock.ownershipToken);
        }
        return null;
      }

      resourceLocks.push({ resource, ownershipToken: token });
    }

    return resourceLocks;
  }

  async withLock<T>(
    resources: string[],
    callback: () => Promise<T>,
  ): Promise<T> {
    const locks = await this.acquireAllLocks(resources);
    if (!locks || locks.length !== resources.length) {
      throw new Error('Failed to acquire one or more locks of resources.');
    }

    try {
      return await callback();
    } finally {
      for (const lock of locks) {
        await this.releaseLock(lock.resource, lock.ownershipToken);
      }
    }
  }
}
