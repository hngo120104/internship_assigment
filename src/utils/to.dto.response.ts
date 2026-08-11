import { ClassConstructor, plainToInstance } from 'class-transformer';

export function toResponseDto<T, V>(cls: ClassConstructor<T>, plain: V): T {
  return plainToInstance(cls, plain, {
    excludeExtraneousValues: true,
  });
}

export function toListResponseDtos<T, V>(
  cls: ClassConstructor<T>,
  plain: V[],
): T[] {
  return plainToInstance(cls, plain, {
    excludeExtraneousValues: true,
  });
}
