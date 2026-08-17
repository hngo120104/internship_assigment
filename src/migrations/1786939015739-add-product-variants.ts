import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductVariants1786939015739 implements MigrationInterface {
  name = 'AddProductVariants1786939015739';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('product_variants'))) {
      await queryRunner.query(`
        CREATE TABLE \`product_variants\` (
          \`id\` varchar(36) NOT NULL DEFAULT (UUID()),
          \`product_id\` varchar(36) NOT NULL,
          \`size\` enum ('S', 'M', 'L', 'XL') NULL,
          \`color\` varchar(50) NULL,
          \`amount\` int NOT NULL DEFAULT 0,
          \`price\` decimal(12, 2) NOT NULL,
          \`is_active\` tinyint NOT NULL DEFAULT 1,
          \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          \`is_deleted\` tinyint NOT NULL DEFAULT 0,
          PRIMARY KEY (\`id\`),
          KEY \`IDX_product_variants_product_id\` (\`product_id\`),
          CONSTRAINT \`FK_product_variants_product\`
            FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE RESTRICT,
          CONSTRAINT \`CHK_product_variants_amount_non_negative\` CHECK (\`amount\` >= 0),
          CONSTRAINT \`CHK_product_variants_price_non_negative\` CHECK (\`price\` >= 0)
        ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci
      `);
      await queryRunner.query(`
        INSERT INTO \`product_variants\`
          (\`id\`, \`product_id\`, \`size\`, \`color\`, \`amount\`, \`price\`,
           \`is_active\`, \`created_at\`, \`updated_at\`, \`is_deleted\`)
        SELECT UUID(), \`id\`, NULL, NULL, \`amount\`, \`price\`,
               \`is_active\`, \`created_at\`, \`updated_at\`, \`is_deleted\`
        FROM \`products\`
      `);
    }

    let cartTable = await queryRunner.getTable('cart_items');
    if (!cartTable?.findColumnByName('variant_id')) {
      await queryRunner.query(`
        ALTER TABLE \`cart_items\`
        ADD COLUMN \`variant_id\` varchar(36) NULL AFTER \`user_id\`
      `);
    }
    cartTable = await queryRunner.getTable('cart_items');
    if (cartTable?.findColumnByName('product_id')) {
      await queryRunner.query(`
        UPDATE \`cart_items\` cart
        INNER JOIN \`product_variants\` variant
          ON variant.\`product_id\` = cart.\`product_id\`
        SET cart.\`variant_id\` = variant.\`id\`
      `);
      if (
        cartTable.foreignKeys.some(
          (key) => key.name === 'FK_cart_items_product',
        )
      ) {
        await queryRunner.query(
          'ALTER TABLE `cart_items` DROP FOREIGN KEY `FK_cart_items_product`',
        );
      }
      if (await this.hasIndex(queryRunner, 'cart_items', 'UQ_cart_product')) {
        await queryRunner.query(
          'ALTER TABLE `cart_items` DROP INDEX `UQ_cart_product`',
        );
      }
      await queryRunner.query(`
        ALTER TABLE \`cart_items\`
        MODIFY COLUMN \`variant_id\` varchar(36) NOT NULL,
        DROP COLUMN \`product_id\`
      `);
    }
    await this.addIndexIfMissing(
      queryRunner,
      'cart_items',
      'IDX_cart_items_user_id',
      '`user_id`',
    );
    await this.addIndexIfMissing(
      queryRunner,
      'cart_items',
      'IDX_cart_items_variant_id',
      '`variant_id`',
    );
    cartTable = await queryRunner.getTable('cart_items');
    if (
      !cartTable?.foreignKeys.some(
        (key) => key.name === 'FK_cart_items_variant',
      )
    ) {
      await queryRunner.query(`
        ALTER TABLE \`cart_items\`
        ADD CONSTRAINT \`FK_cart_items_variant\`
          FOREIGN KEY (\`variant_id\`) REFERENCES \`product_variants\` (\`id\`) ON DELETE RESTRICT
      `);
    }

    let orderItemsTable = await queryRunner.getTable('order_items');
    if (!orderItemsTable?.findColumnByName('variant_id')) {
      await queryRunner.query(`
        ALTER TABLE \`order_items\`
        ADD COLUMN \`variant_id\` varchar(36) NULL AFTER \`product_id\`
      `);
    }
    orderItemsTable = await queryRunner.getTable('order_items');
    if (!orderItemsTable?.findColumnByName('variant_size')) {
      await queryRunner.query(`
        ALTER TABLE \`order_items\`
        ADD COLUMN \`variant_size\` enum ('S', 'M', 'L', 'XL') NULL AFTER \`product_name\`
      `);
    }
    orderItemsTable = await queryRunner.getTable('order_items');
    if (!orderItemsTable?.findColumnByName('variant_color')) {
      await queryRunner.query(`
        ALTER TABLE \`order_items\`
        ADD COLUMN \`variant_color\` varchar(50) NULL AFTER \`variant_size\`
      `);
    }
    await queryRunner.query(`
      UPDATE \`order_items\` item
      INNER JOIN \`product_variants\` variant
        ON variant.\`product_id\` = item.\`product_id\`
      SET item.\`variant_id\` = variant.\`id\`,
          item.\`variant_size\` = variant.\`size\`,
          item.\`variant_color\` = variant.\`color\`
      WHERE item.\`variant_id\` IS NULL
    `);
    await this.addIndexIfMissing(
      queryRunner,
      'order_items',
      'IDX_order_items_order_id',
      '`order_id`',
    );
    if (
      await this.hasIndex(
        queryRunner,
        'order_items',
        'UQ_order_items_order_product',
      )
    ) {
      await queryRunner.query(
        'ALTER TABLE `order_items` DROP INDEX `UQ_order_items_order_product`',
      );
    }
    orderItemsTable = await queryRunner.getTable('order_items');
    if (orderItemsTable?.findColumnByName('variant_id')?.isNullable) {
      await queryRunner.query(
        'ALTER TABLE `order_items` MODIFY COLUMN `variant_id` varchar(36) NOT NULL',
      );
    }
    if (
      !(await this.hasIndex(
        queryRunner,
        'order_items',
        'UQ_order_items_order_variant',
      ))
    ) {
      await queryRunner.query(
        'ALTER TABLE `order_items` ADD UNIQUE KEY `UQ_order_items_order_variant` (`order_id`, `variant_id`)',
      );
    }
    await this.addIndexIfMissing(
      queryRunner,
      'order_items',
      'IDX_order_items_variant_id',
      '`variant_id`',
    );
    orderItemsTable = await queryRunner.getTable('order_items');
    if (
      !orderItemsTable?.foreignKeys.some(
        (key) => key.name === 'FK_order_items_variant_id',
      )
    ) {
      await queryRunner.query(`
        ALTER TABLE \`order_items\`
        ADD CONSTRAINT \`FK_order_items_variant_id\`
          FOREIGN KEY (\`variant_id\`) REFERENCES \`product_variants\` (\`id\`) ON DELETE RESTRICT
      `);
    }

    await this.addIndexIfMissing(
      queryRunner,
      'orders',
      'IDX_orders_user_id',
      '`user_id`',
    );

    let productsTable = await queryRunner.getTable('products');
    if (
      productsTable?.checks.some(
        (check) => check.name === 'CHK_products_amount_non_negative',
      )
    ) {
      await queryRunner.query(
        'ALTER TABLE `products` DROP CHECK `CHK_products_amount_non_negative`',
      );
    }
    productsTable = await queryRunner.getTable('products');
    if (
      productsTable?.checks.some(
        (check) => check.name === 'CHK_products_price_non_negative',
      )
    ) {
      await queryRunner.query(
        'ALTER TABLE `products` DROP CHECK `CHK_products_price_non_negative`',
      );
    }
    productsTable = await queryRunner.getTable('products');
    if (productsTable?.findColumnByName('amount')) {
      await queryRunner.query('ALTER TABLE `products` DROP COLUMN `amount`');
    }
    productsTable = await queryRunner.getTable('products');
    if (productsTable?.findColumnByName('price')) {
      await queryRunner.query('ALTER TABLE `products` DROP COLUMN `price`');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`products\`
      ADD COLUMN \`amount\` int NOT NULL DEFAULT 0 AFTER \`description\`,
      ADD COLUMN \`price\` decimal(12, 2) NOT NULL DEFAULT 0 AFTER \`amount\`
    `);
    await queryRunner.query(`
      UPDATE \`products\` product
      INNER JOIN (
        SELECT \`product_id\`, SUM(\`amount\`) AS \`amount\`, MIN(\`price\`) AS \`price\`
        FROM \`product_variants\`
        GROUP BY \`product_id\`
      ) variant ON variant.\`product_id\` = product.\`id\`
      SET product.\`amount\` = variant.\`amount\`,
          product.\`price\` = variant.\`price\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`products\`
      ADD CONSTRAINT \`CHK_products_amount_non_negative\` CHECK (\`amount\` >= 0),
      ADD CONSTRAINT \`CHK_products_price_non_negative\` CHECK (\`price\` >= 0)
    `);

    await queryRunner.query(`
      ALTER TABLE \`cart_items\`
      ADD COLUMN \`product_id\` varchar(36) NULL AFTER \`user_id\`
    `);
    await queryRunner.query(`
      UPDATE \`cart_items\` cart
      INNER JOIN \`product_variants\` variant
        ON variant.\`id\` = cart.\`variant_id\`
      SET cart.\`product_id\` = variant.\`product_id\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`cart_items\`
      DROP FOREIGN KEY \`FK_cart_items_variant\`,
      DROP INDEX \`IDX_cart_items_variant_id\`,
      DROP INDEX \`IDX_cart_items_user_id\`,
      MODIFY COLUMN \`product_id\` varchar(36) NOT NULL,
      DROP COLUMN \`variant_id\`,
      ADD UNIQUE KEY \`UQ_cart_product\` (\`product_id\`),
      ADD CONSTRAINT \`FK_cart_items_product\`
        FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE \`order_items\`
      DROP FOREIGN KEY \`FK_order_items_variant_id\`,
      DROP INDEX \`UQ_order_items_order_variant\`,
      DROP INDEX \`IDX_order_items_variant_id\`,
      DROP INDEX \`IDX_order_items_order_id\`,
      DROP COLUMN \`variant_id\`,
      DROP COLUMN \`variant_size\`,
      DROP COLUMN \`variant_color\`,
      ADD UNIQUE KEY \`UQ_order_items_order_product\` (\`order_id\`, \`product_id\`)
    `);
    await queryRunner.query(
      'ALTER TABLE `orders` DROP INDEX `IDX_orders_user_id`',
    );
    await queryRunner.query('DROP TABLE `product_variants`');
  }

  private async addIndexIfMissing(
    queryRunner: QueryRunner,
    tableName: string,
    indexName: string,
    columnsSql: string,
  ): Promise<void> {
    if (await this.hasIndex(queryRunner, tableName, indexName)) return;
    await queryRunner.query(
      `ALTER TABLE \`${tableName}\` ADD KEY \`${indexName}\` (${columnsSql})`,
    );
  }

  private async hasIndex(
    queryRunner: QueryRunner,
    tableName: string,
    indexName: string,
  ): Promise<boolean> {
    const rows = (await queryRunner.query(
      `
        SELECT COUNT(*) AS \`count\`
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND INDEX_NAME = ?
      `,
      [tableName, indexName],
    )) as Array<{ count: number | string }>;
    return Number(rows[0]?.count ?? 0) > 0;
  }
}
