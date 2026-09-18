import { Test, TestingModule } from '@nestjs/testing';
import { RedisLockService } from './redis-lock.service';

describe('RedisLockService', () => {
  let service: RedisLockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisLockService],
    }).compile();

    service = module.get<RedisLockService>(RedisLockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
