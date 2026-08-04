import { Column, PrimaryColumn } from 'typeorm';
import { UuidBinaryTransformer } from '../modules/transformer/uuid.binary.transformer';

export const PrimaryGeneratedBinaryUuidColumn = (): ReturnType<
  typeof PrimaryColumn
> =>
  PrimaryColumn({
    type: 'binary',
    length: 16,
    generated: false,
    transformer: UuidBinaryTransformer,
    default: () => '(UUID_TO_BIN(UUID(), 1))',
  });

export const BinaryUuidColumn = (name?: string): ReturnType<typeof Column> =>
  Column({
    type: 'binary',
    name,
    length: 16,
    generated: false,
    transformer: UuidBinaryTransformer,
    unique: false,
  });
