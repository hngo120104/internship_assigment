import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

const CART_ITEMS_TABLE = 'cart_items';
const LEGACY_UNIQUE_INDEX = 'UQ_cart_user';
const USER_STATUS_INDEX = 'IDX_cart_items_user_status';
const PRODUCT_INDEX = 'IDX_cart_items_product_id';

export class FixCartItemsUserIndex1786429200000 implements MigrationInterface {
  name = 'FixCartItemsUserIndex1786429200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const cartItemsTable = await queryRunner.getTable(CART_ITEMS_TABLE);
    if (!cartItemsTable) return;

    if (
      !cartItemsTable.indices.some((index) => index.name === USER_STATUS_INDEX)
    ) {
      await queryRunner.createIndex(
        CART_ITEMS_TABLE,
        new TableIndex({
          name: USER_STATUS_INDEX,
          columnNames: ['user_id', 'cart_item_status', 'is_deleted'],
        }),
      );
    }

    const legacyUniqueIndex = cartItemsTable.indices.find(
      (index) => index.name === LEGACY_UNIQUE_INDEX,
    );
    if (legacyUniqueIndex) {
      await queryRunner.dropIndex(CART_ITEMS_TABLE, legacyUniqueIndex);
    }

    const hasProductIndex = cartItemsTable.indices.some(
      (index) =>
        index.columnNames.length === 1 && index.columnNames[0] === 'product_id',
    );
    if (!hasProductIndex) {
      await queryRunner.createIndex(
        CART_ITEMS_TABLE,
        new TableIndex({
          name: PRODUCT_INDEX,
          columnNames: ['product_id'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const cartItemsTable = await queryRunner.getTable(CART_ITEMS_TABLE);
    if (!cartItemsTable) return;

    const duplicateUsers = (await queryRunner.query(
      `SELECT user_id FROM cart_items GROUP BY user_id HAVING COUNT(*) > 1 LIMIT 1`,
    )) as unknown[];
    if (duplicateUsers.length > 0) {
      throw new Error(
        'Cannot restore UQ_cart_user while a user has multiple cart items.',
      );
    }

    if (
      !cartItemsTable.indices.some(
        (index) => index.name === LEGACY_UNIQUE_INDEX,
      )
    ) {
      await queryRunner.createIndex(
        CART_ITEMS_TABLE,
        new TableIndex({
          name: LEGACY_UNIQUE_INDEX,
          columnNames: ['user_id'],
          isUnique: true,
        }),
      );
    }

    const userStatusIndex = cartItemsTable.indices.find(
      (index) => index.name === USER_STATUS_INDEX,
    );
    if (userStatusIndex) {
      await queryRunner.dropIndex(CART_ITEMS_TABLE, userStatusIndex);
    }
  }
}
