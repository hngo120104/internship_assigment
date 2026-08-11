import { MigrationInterface, QueryRunner } from 'typeorm';

export class SplitOrderAndPaymentStatusAddChecks1786070400000 implements MigrationInterface {
  name = 'SplitOrderAndPaymentStatusAddChecks1786070400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const ordersTable = await queryRunner.getTable('orders');
    if (!ordersTable) return;

    if (!ordersTable.findColumnByName('payment_status')) {
      await queryRunner.query(`
        ALTER TABLE \`orders\`
        ADD COLUMN \`payment_status\`
          ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED')
          NOT NULL DEFAULT 'PENDING'
          AFTER \`order_status\`
      `);

      await queryRunner.query(`
        UPDATE \`orders\`
        SET \`payment_status\` = CASE \`order_status\`
          WHEN 'PAID' THEN 'PAID'
          WHEN 'FAILED' THEN 'FAILED'
          WHEN 'REFUNDED' THEN 'REFUNDED'
          ELSE 'PENDING'
        END
      `);
    }

    const targetOrderStatuses = [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPING',
      'DELIVERED',
      'CANCELLED',
    ];
    const orderStatusColumn = ordersTable.findColumnByName('order_status');
    const orderStatuses = orderStatusColumn?.enum ?? [];
    const orderStatusNeedsMigration =
      orderStatusColumn?.isNullable === true ||
      targetOrderStatuses.some((status) => !orderStatuses.includes(status)) ||
      orderStatuses.some((status) => !targetOrderStatuses.includes(status));

    if (orderStatusNeedsMigration) {
      await queryRunner.query(`
        UPDATE \`orders\`
        SET \`order_status\` = 'PENDING'
        WHERE \`order_status\` IS NULL
      `);

      await queryRunner.query(`
        ALTER TABLE \`orders\`
        MODIFY COLUMN \`order_status\`
          ENUM(
            'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING',
            'DELIVERED', 'CANCELLED', 'SUCCESS', 'PAID',
            'CANCEL', 'FAILED', 'REFUNDED'
          ) NOT NULL DEFAULT 'PENDING'
      `);

      await queryRunner.query(`
        UPDATE \`orders\`
        SET \`order_status\` = CASE \`order_status\`
          WHEN 'SUCCESS' THEN 'DELIVERED'
          WHEN 'CANCEL' THEN 'CANCELLED'
          WHEN 'PAID' THEN 'CONFIRMED'
          WHEN 'FAILED' THEN 'CANCELLED'
          WHEN 'REFUNDED' THEN 'CANCELLED'
          ELSE \`order_status\`
        END
      `);

      await queryRunner.query(`
        ALTER TABLE \`orders\`
        MODIFY COLUMN \`order_status\`
          ENUM(
            'PENDING', 'CONFIRMED', 'PROCESSING',
            'SHIPPING', 'DELIVERED', 'CANCELLED'
          ) NOT NULL DEFAULT 'PENDING'
      `);
    }

    await this.addCheckIfMissing(
      queryRunner,
      'orders',
      'CHK_orders_discount_non_negative',
      '`discount` >= 0',
    );
    await this.addCheckIfMissing(
      queryRunner,
      'orders',
      'CHK_orders_shipping_fee_non_negative',
      '`shipping_fee` >= 0',
    );

    if (!(await queryRunner.hasTable('order_items'))) return;
    await this.addCheckIfMissing(
      queryRunner,
      'order_items',
      'CHK_order_items_quantity_positive',
      '`quantity` > 0',
    );
    await this.addCheckIfMissing(
      queryRunner,
      'order_items',
      'CHK_order_items_unit_price_non_negative',
      '`unit_price` >= 0',
    );
  }

  private async addCheckIfMissing(
    queryRunner: QueryRunner,
    tableName: string,
    checkName: string,
    expression: string,
  ): Promise<void> {
    const existingChecks = (await queryRunner.query(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
       WHERE CONSTRAINT_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND CONSTRAINT_NAME = ?
         AND CONSTRAINT_TYPE = 'CHECK'`,
      [tableName, checkName],
    )) as unknown[];
    if (existingChecks.length > 0) return;
    await queryRunner.query(
      `ALTER TABLE \`${tableName}\` ADD CONSTRAINT \`${checkName}\` CHECK (${expression})`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`order_items\`
      DROP CHECK \`CHK_order_items_quantity_positive\`,
      DROP CHECK \`CHK_order_items_unit_price_non_negative\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`orders\`
      DROP CHECK \`CHK_orders_discount_non_negative\`,
      DROP CHECK \`CHK_orders_shipping_fee_non_negative\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`orders\`
      MODIFY COLUMN \`order_status\`
        ENUM(
          'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING',
          'DELIVERED', 'CANCELLED', 'SUCCESS', 'PAID',
          'CANCEL', 'FAILED', 'REFUNDED'
        ) NOT NULL DEFAULT 'PENDING'
    `);

    await queryRunner.query(`
      UPDATE \`orders\`
      SET \`order_status\` = CASE \`order_status\`
        WHEN 'DELIVERED' THEN 'SUCCESS'
        WHEN 'CANCELLED' THEN CASE \`payment_status\`
          WHEN 'REFUNDED' THEN 'REFUNDED'
          WHEN 'FAILED' THEN 'FAILED'
          ELSE 'CANCEL'
        END
        WHEN 'CONFIRMED' THEN CASE \`payment_status\`
          WHEN 'PAID' THEN 'PAID'
          ELSE 'PENDING'
        END
        WHEN 'PROCESSING' THEN CASE \`payment_status\`
          WHEN 'PAID' THEN 'PAID'
          ELSE 'PENDING'
        END
        ELSE \`order_status\`
      END
    `);

    await queryRunner.query(`
      ALTER TABLE \`orders\`
      MODIFY COLUMN \`order_status\`
        ENUM(
          'SHIPPING', 'SUCCESS', 'PAID', 'PENDING',
          'CANCEL', 'FAILED', 'REFUNDED'
        ) NULL DEFAULT 'PENDING'
    `);

    await queryRunner.query(`
      ALTER TABLE \`orders\`
      DROP COLUMN \`payment_status\`
    `);
  }
}
