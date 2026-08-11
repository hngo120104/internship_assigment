import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

interface UuidColumnDefinition {
  tableName: string;
  columnName: string;
  nullable?: boolean;
  entityId?: boolean;
}

const UUID_COLUMNS: UuidColumnDefinition[] = [
  { tableName: 'roles', columnName: 'id', entityId: true },
  { tableName: 'users', columnName: 'id', entityId: true },
  { tableName: 'user_roles', columnName: 'user_id' },
  { tableName: 'user_roles', columnName: 'role_id' },
  { tableName: 'user_addresses', columnName: 'id', entityId: true },
  { tableName: 'user_addresses', columnName: 'user_id' },
  { tableName: 'user_photos', columnName: 'id', entityId: true },
  { tableName: 'user_photos', columnName: 'user_id' },
  { tableName: 'shops', columnName: 'id', entityId: true },
  { tableName: 'shops', columnName: 'user_id' },
  { tableName: 'shop_photos', columnName: 'id', entityId: true },
  { tableName: 'shop_photos', columnName: 'shop_id' },
  { tableName: 'categories', columnName: 'id', entityId: true },
  { tableName: 'categories', columnName: 'parent_id', nullable: true },
  { tableName: 'products', columnName: 'id', entityId: true },
  { tableName: 'products', columnName: 'shop_id' },
  { tableName: 'product_categories', columnName: 'product_id' },
  { tableName: 'product_categories', columnName: 'category_id' },
  { tableName: 'product_photos', columnName: 'id', entityId: true },
  { tableName: 'product_photos', columnName: 'product_id' },
  { tableName: 'carts', columnName: 'id', entityId: true },
  { tableName: 'carts', columnName: 'user_id', nullable: true },
  { tableName: 'cart_items', columnName: 'id', entityId: true },
  { tableName: 'cart_items', columnName: 'cart_id' },
  { tableName: 'cart_items', columnName: 'product_id' },
  { tableName: 'orders', columnName: 'id', entityId: true },
  { tableName: 'orders', columnName: 'user_id' },
  { tableName: 'orders', columnName: 'shop_id' },
  { tableName: 'orders', columnName: 'recipient_address_id' },
  { tableName: 'order_items', columnName: 'id', entityId: true },
  { tableName: 'order_items', columnName: 'order_id' },
  { tableName: 'order_items', columnName: 'product_id' },
];

const TABLE_NAMES = [
  ...new Set(UUID_COLUMNS.map(({ tableName }) => tableName)),
];

export class ConvertBinaryUuidsToVarchar1786425600000 implements MigrationInterface {
  name = 'ConvertBinaryUuidsToVarchar1786425600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.convertColumns(queryRunner, 'varchar');
    await this.ensureVarcharUuidDefaults(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.convertColumns(queryRunner, 'binary');
  }

  private async convertColumns(
    queryRunner: QueryRunner,
    targetType: 'varchar' | 'binary',
  ): Promise<void> {
    const tables = await queryRunner.getTables(TABLE_NAMES);
    const tableByName = new Map(tables.map((table) => [table.name, table]));
    const sourceTypes =
      targetType === 'varchar'
        ? new Set(['binary', 'varbinary'])
        : new Set(['varchar']);
    const columnsToConvert = UUID_COLUMNS.filter(
      ({ tableName, columnName }) => {
        const column = tableByName.get(tableName)?.findColumnByName(columnName);
        return column ? sourceTypes.has(column.type.toLowerCase()) : false;
      },
    );

    if (columnsToConvert.length === 0) return;

    const foreignKeys = tables.flatMap((table) =>
      table.foreignKeys.map((foreignKey) => ({
        tableName: table.name,
        foreignKey: new TableForeignKey({
          name: foreignKey.name,
          columnNames: foreignKey.columnNames,
          referencedDatabase: foreignKey.referencedDatabase,
          referencedSchema: foreignKey.referencedSchema,
          referencedTableName: foreignKey.referencedTableName,
          referencedColumnNames: foreignKey.referencedColumnNames,
          onDelete: foreignKey.onDelete,
          onUpdate: foreignKey.onUpdate,
          deferrable: foreignKey.deferrable,
        }),
      })),
    );

    for (const { tableName, foreignKey } of foreignKeys) {
      await queryRunner.dropForeignKey(tableName, foreignKey.name!);
    }

    for (const column of columnsToConvert) {
      if (targetType === 'varchar') {
        await this.convertToVarchar(queryRunner, column);
      } else {
        await this.convertToBinary(queryRunner, column);
      }
    }

    for (const { tableName, foreignKey } of foreignKeys) {
      await queryRunner.createForeignKey(tableName, foreignKey);
    }
  }

  private async convertToVarchar(
    queryRunner: QueryRunner,
    column: UuidColumnDefinition,
  ): Promise<void> {
    const nullability = column.nullable ? 'NULL' : 'NOT NULL';
    const defaultValue = column.entityId ? ' DEFAULT (UUID())' : '';
    const qualifiedColumn = `\`${column.columnName}\``;

    await queryRunner.query(
      `ALTER TABLE \`${column.tableName}\` MODIFY COLUMN ${qualifiedColumn} VARBINARY(36) ${nullability}`,
    );
    // The removed transformer exposed the bytes without MySQL's UUID swap flag.
    // Converting the same way preserves every UUID previously returned by the API.
    await queryRunner.query(
      `UPDATE \`${column.tableName}\` SET ${qualifiedColumn} = BIN_TO_UUID(${qualifiedColumn}) WHERE ${qualifiedColumn} IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`${column.tableName}\` MODIFY COLUMN ${qualifiedColumn} VARCHAR(36) ${nullability}${defaultValue}`,
    );
  }

  private async ensureVarcharUuidDefaults(
    queryRunner: QueryRunner,
  ): Promise<void> {
    const tables = await queryRunner.getTables(TABLE_NAMES);

    for (const { tableName, columnName } of UUID_COLUMNS.filter(
      ({ entityId }) => entityId,
    )) {
      const idColumn = tables
        .find((table) => table.name === tableName)
        ?.findColumnByName(columnName);
      if (!idColumn || idColumn.type.toLowerCase() !== 'varchar') continue;

      await queryRunner.query(
        `ALTER TABLE \`${tableName}\` ALTER COLUMN \`${columnName}\` SET DEFAULT (UUID())`,
      );
    }
  }

  private async convertToBinary(
    queryRunner: QueryRunner,
    column: UuidColumnDefinition,
  ): Promise<void> {
    const nullability = column.nullable ? 'NULL' : 'NOT NULL';
    const defaultValue = column.entityId
      ? ' DEFAULT (UUID_TO_BIN(UUID(), 1))'
      : '';
    const qualifiedColumn = `\`${column.columnName}\``;

    await queryRunner.query(
      `ALTER TABLE \`${column.tableName}\` MODIFY COLUMN ${qualifiedColumn} VARBINARY(36) ${nullability}`,
    );
    await queryRunner.query(
      `UPDATE \`${column.tableName}\` SET ${qualifiedColumn} = UUID_TO_BIN(CAST(${qualifiedColumn} AS CHAR)) WHERE ${qualifiedColumn} IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`${column.tableName}\` MODIFY COLUMN ${qualifiedColumn} BINARY(16) ${nullability}${defaultValue}`,
    );
  }
}
