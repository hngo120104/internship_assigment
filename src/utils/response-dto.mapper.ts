import { ClassConstructor, plainToInstance } from 'class-transformer';

export function toResponseDto<T, V>(
  cls: ClassConstructor<T>,
  plain: V,
  groups?: string[],
): T {
  return plainToInstance(cls, plain, {
    groups: groups,
    excludeExtraneousValues: true,
  });
}

export function toListResponseDtos<T, V>(
  cls: ClassConstructor<T>,
  plain: V[],
  groups?: string[],
): T[] {
  return plainToInstance(cls, plain, {
    groups: groups,
    excludeExtraneousValues: true,
  });
}
