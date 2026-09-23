import { Inject, Injectable } from '@nestjs/common';
import { REDLOCK_CLIENT } from '../constants/redis.constants';
import type Redlock from 'redlock';
import type { Lock, RedlockAbortSignal } from 'redlock';

@Injectable()
export class RedlockService {
  constructor(
    @Inject(REDLOCK_CLIENT)
    private readonly redlock: Redlock,
  ) {}

  acquireLock(resources: string[], ttlMs: number): Promise<Lock> {
    return this.redlock.acquire(resources, ttlMs);
  }

  acquireAllLocks(resources: string[], ttlMs: number): Promise<Lock> {
    return this.acquireLock(resources, ttlMs);
  }

  async releaseLock(lock: Lock): Promise<void> {
    await lock.release();
  }

  extendLock(lock: Lock, ttlMs: number): Promise<Lock> {
    return lock.extend(ttlMs);
  }

  isExpired(lock: Lock, now: number = Date.now()): boolean {
    return lock.expiration <= now;
  }

  withLock<T>(
    resources: string[],
    ttlMs: number,
    callback: (signal: RedlockAbortSignal) => Promise<T>,
  ): Promise<T> {
    return this.redlock.using(resources, ttlMs, async (signal) => {
      const result = await callback(signal);

      if (signal.aborted) {
        throw signal.error ?? new Error('The lock expired during execution.');
      }

      return result;
    });
  }
}
