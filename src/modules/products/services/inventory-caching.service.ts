import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REDIS_CLIENT } from '../../redis/constants/redis.constants';
import Redis from 'ioredis';
import { ProductVariantsRepository } from '../repositories/product-variants.repository';

export enum RedisCompensationReturn {
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  COMPENSATION_EXISTS = 'COMPENSATION_EXISTS',
  RESERVATION_NOT_FOUND = 'RESERVATION_NOT_FOUND',
  INVALID_ARGUMENTS = 'INVALID_ARGUMENTS',
  SUCCESS = 'SUCCESS',
}

export enum RedisReservationReturn {
  INVALID_ARGUMENTS = 'INVALID_ARGUMENTS',
  ALREADY_RESERVED = 'ALREADY_RESERVED',
  ALREADY_COMPENSATED = 'ALREADY_COMPENSATED',
  ALREADY_COMPLETED = 'ALREADY_COMPLETED',
  CACHE_MISS = 'CACHE_MISS',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS',
}

export enum RedisCompletionReturn {
  ALREADY_COMPLETED = 'ALREADY_COMPLETED',
  RESERVATION_NOT_FOUND = 'RESERVATION_NOT_FOUND',
  SUCCESS = 'SUCCESS',
}

export enum RedisCheckoutState {
  RESERVED = 'RESERVED',
  COMPLETED = 'COMPLETED',
  COMPENSATED = 'COMPENSATED',
}

export interface RedisSucceededItem {
  variantId: string;
  reservedAmount: number;
}

export interface RedisFailedItem {
  variantId: string;
  requestAmount: number;
  availableAmount: number;
}

export interface RedisReservationResult {
  state: RedisReservationReturn;
  succeededItems?: RedisSucceededItem[];
  failedItems?: RedisFailedItem[];
}

@Injectable()
export class InventoryCachingService {
  private readonly VARIANT_STOCK_PREFIX = 'cache:inventory:amount:';
  private readonly RESERVATION_RECORD = 'inventory:reservation:';
  private readonly bulkReservationLuaScript = `
        local failedItems = {}
        local succeededItems = {}
        local status = redis.call("GET", KEYS[1])

        if status == "RESERVED" then
          return { "ALREADY_RESERVED" }
        end

        if status == "COMPENSATED" then
          return { "ALREADY_COMPENSATED" }
        end

        if status == "COMPLETED" then 
          return { "ALREADY_COMPLETED" }
        end



        if #KEYS-1 ~= #ARGV then
            return { "INVALID_ARGUMENTS" }
        end

        for i = 2, #KEYS do
            local key = KEYS[i]
            local requestAmount = tonumber(ARGV[i-1])
            local stockValue = redis.call("GET", key)

            local availableAmount = tonumber(stockValue)

            if not requestAmount or requestAmount <= 0 then
              return { "INVALID_AMOUNT" }
            end

            if not stockValue then
                return { "CACHE_MISS", key }
            end

            if availableAmount < requestAmount then
                table.insert(failedItems, key)
                table.insert(failedItems, requestAmount)
                table.insert(failedItems, availableAmount)
            end
        end

        if #failedItems > 0 then
            local result = { "FAILED" }

            for i = 1, #failedItems do
                table.insert(result, failedItems[i])
            end

            return result
        end

        for i = 2, #KEYS do
            redis.call(
                "DECRBY",
                KEYS[i],
                tonumber(ARGV[i-1])
            )
            table.insert(succeededItems, KEYS[i])
            table.insert(succeededItems, tonumber(ARGV[i-1]))
        end
        redis.call("SET", KEYS[1], "RESERVED", "EX", 86400)

        local result = { "SUCCESS" }
        for i = 1, #succeededItems do
          table.insert(result, succeededItems[i])
        end
        return result
    `;

  private readonly bulkCompensationLuaScript = `
      local status = redis.call("GET", KEYS[1])

      if status == "COMPENSATED" then
        return { "COMPENSATION_EXISTS" }
      end

      if status ~= "RESERVED" then
        return { "RESERVATION_NOT_FOUND" }
      end 

      if #KEYS < 2 then
        return { "INVALID_ARGUMENTS" }
      end

      if (#KEYS-1) ~= #ARGV then
        return { "INVALID_ARGUMENTS" }
      end

      for i=2, #KEYS do
        local amount = tonumber(ARGV[i-1])
        if not amount or amount <= 0 then
          return { "INVALID_AMOUNT" }
        end
        redis.call("INCRBY", KEYS[i], ARGV[i-1])
      end

      redis.call("SET", KEYS[1], "COMPENSATED", "EX", 86400)

      return { "SUCCESS" }
    `;

  private readonly completeReservationLuaScript = `
      local status = redis.call("GET", KEYS[1])

      if status == "COMPLETED" then
        return { "ALREADY_COMPLETED" }
      end

      if status ~= "RESERVED" then
        return { "RESERVATION_NOT_FOUND" }
      end

      redis.call("SET", KEYS[1], "COMPLETED", "EX", 86400)
      return { "SUCCESS" }
    `;

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
    private readonly productVariantRepository: ProductVariantsRepository,
  ) {}

  private createKey(variantId: string): string {
    return `${this.VARIANT_STOCK_PREFIX}${variantId}`;
  }

  async getAvailableAmounts(variantIds: string[]): Promise<number[]> {
    const keys = variantIds.map((id) => this.createKey(id));

    let amounts = await this.redisClient.mget(keys);

    const missingIds = variantIds.filter((_, index) => amounts[index] === null);

    if (missingIds.length > 0) {
      await this.syncAmountsToCache(missingIds);

      amounts = await this.redisClient.mget(keys);
    }

    if (amounts.some((amount) => amount === null)) {
      throw new Error('Unable to initialize inventory cache.');
    }

    return amounts.map((amount) => Number(amount));
  }

  private async syncAmountsToCache(variantIds: string[]): Promise<number[]> {
    const variants =
      await this.productVariantRepository.findPurchasableProductVariantsByIds(
        variantIds,
      );
    if (variants.length !== variantIds.length)
      throw new NotFoundException(
        'Variant not found. Cannot sync redis cache.',
      );

    const pipeline = this.redisClient.pipeline();
    variants.forEach((variant) =>
      pipeline.set(this.createKey(variant.id), variant.amount, 'NX'),
    );
    await pipeline.exec();
    return variants.map((variant) => variant.amount);
  }

  async reserveInventory(
    idempotencyKey: string,
    reservationRequests: {
      variantId: string;
      amount: number;
    }[],
  ): Promise<RedisReservationResult> {
    await this.getAvailableAmounts(
      reservationRequests.map((request) => request.variantId),
    );
    const reservationResult = await this.executeLuaScript(
      idempotencyKey,
      this.bulkReservationLuaScript,
      reservationRequests,
    );
    switch (reservationResult[0]) {
      case RedisReservationReturn.ALREADY_COMPENSATED:
        return {
          state: RedisReservationReturn.ALREADY_COMPENSATED,
        };
      case RedisReservationReturn.ALREADY_RESERVED:
        return {
          state: RedisReservationReturn.ALREADY_RESERVED,
        };
      case RedisReservationReturn.ALREADY_COMPLETED:
        return {
          state: RedisReservationReturn.ALREADY_COMPLETED,
        };
      case RedisReservationReturn.INVALID_ARGUMENTS:
        throw new Error('Redis caching error.');
      case RedisReservationReturn.INVALID_AMOUNT:
        throw new Error('Redis caching error.');
      case RedisReservationReturn.CACHE_MISS:
        throw new Error('Inventory cache miss after initialization.');
      case RedisReservationReturn.FAILED: {
        const failedItems: RedisFailedItem[] = [];
        for (let i = 1; i < reservationResult.length; i += 3) {
          const variantId = (reservationResult[i] as string).slice(
            this.VARIANT_STOCK_PREFIX.length,
          );
          const requestAmount = Number(reservationResult[i + 1]);
          const availableAMount = Number(reservationResult[i + 2]);
          failedItems.push({
            variantId: variantId,
            requestAmount: requestAmount,
            availableAmount: availableAMount,
          });
        }
        return {
          state: RedisReservationReturn.FAILED,
          failedItems,
        };
      }
      case RedisReservationReturn.SUCCESS: {
        const succeededItems: RedisSucceededItem[] = [];
        for (let i = 1; i < reservationResult.length; i += 2) {
          const variantId = (reservationResult[i] as string).slice(
            this.VARIANT_STOCK_PREFIX.length,
          );
          const reservedAmount = Number(reservationResult[i + 1]);
          succeededItems.push({
            variantId: variantId,
            reservedAmount: reservedAmount,
          });
        }
        return {
          state: RedisReservationReturn.SUCCESS,
          succeededItems,
        };
      }
      default:
        throw new Error(`Unexpected Redis reservation result.`);
    }
  }

  async completeReservation(idempotencyKey: string): Promise<void> {
    const checkoutKey = `${this.RESERVATION_RECORD}${idempotencyKey}`;
    const result = (await this.redisClient.eval(
      this.completeReservationLuaScript,
      1,
      checkoutKey,
    )) as Array<string | number>;

    switch (result[0]) {
      case RedisCompletionReturn.SUCCESS:
      case RedisCompletionReturn.ALREADY_COMPLETED:
        return;
      case RedisCompletionReturn.RESERVATION_NOT_FOUND:
        throw new Error('Redis reservation not found.');
      default:
        throw new Error('Unexpected Redis completion result.');
    }
  }

  private async executeLuaScript(
    idempotencyKey: string,
    luaScript: string,
    reservationRequests: {
      variantId: string;
      amount: number;
    }[],
  ) {
    const checkoutKey = `${this.RESERVATION_RECORD}${idempotencyKey}`;

    const keys = reservationRequests.map((rq) => this.createKey(rq.variantId));

    return (await this.redisClient.eval(
      luaScript,
      keys.length + 1,
      checkoutKey,
      ...keys,
      ...reservationRequests.map((rq) => rq.amount),
    )) as Array<string | number>;
  }

  async releaseReservations(
    idempotencyKey: string,
    reservationRequests: {
      variantId: string;
      amount: number;
    }[],
  ) {
    const result = await this.executeLuaScript(
      idempotencyKey,
      this.bulkCompensationLuaScript,
      reservationRequests,
    );

    switch (result[0]) {
      case RedisCompensationReturn.INVALID_ARGUMENTS.toString():
        throw new Error(`Redis error: ${result[0]}`);
      case RedisCompensationReturn.INVALID_AMOUNT.toString():
        throw new Error(`Redis error: ${result[0]}`);
      case RedisCompensationReturn.COMPENSATION_EXISTS.toString():
        return;
      case RedisCompensationReturn.RESERVATION_NOT_FOUND.toString():
        throw new Error(`Redis error: ${result[0]}`);
      case RedisCompensationReturn.SUCCESS.toString():
        return;
      default:
        throw new Error('Unexpected redis error.');
    }
  }
}
