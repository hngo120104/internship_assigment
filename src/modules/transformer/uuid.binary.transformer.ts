import { ValueTransformer } from 'typeorm';

export const UuidBinaryTransformer: ValueTransformer = {
  to: (value: string | undefined | null) => {
    if (!value || typeof value !== 'string' || value.length !== 36)
      return value;
    return Buffer.from(value.replace(/-/g, ''), 'hex');
  },

  from: (value: Buffer | undefined | null) => {
    if (!value || !Buffer.isBuffer(value)) return value;
    const hex = value.toString('hex');
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32),
    ].join('-');
  },
};
