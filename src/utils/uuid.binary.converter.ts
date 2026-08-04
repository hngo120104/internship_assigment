import { BadRequestException } from '@nestjs/common';

export function uuidToBinary(uuid: string): Buffer {
  if (!uuid || uuid.length !== 36)
    throw new BadRequestException('Invalid uuid');
  const cleanUuid = uuid.replace(/-/g, '');
  return Buffer.from(cleanUuid, 'hex');
}

export function binaryToUuid(binary: Buffer): string | null {
  if (!binary || !Buffer.isBuffer(binary))
    throw new BadRequestException('Invalid binary id');
  const hexString = binary.toString('hex');
  return [
    hexString.slice(0, 8),
    hexString.slice(8, 12),
    hexString.slice(12, 16),
    hexString.slice(16, 20),
    hexString.slice(20, 32),
  ].join('-');
}
