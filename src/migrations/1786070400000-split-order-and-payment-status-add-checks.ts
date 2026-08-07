import { MigrationInterface, QueryRunner } from 'typeorm';

export class SplitOrderAndPaymentStatusAddChecks1786070400000 implements MigrationInterface {
  name = 'SplitOrderAndPaymentStatusAddChecks1786070400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

    await queryRunner.query(`
      ALTER TABLE \`orders\`
      ADD CONSTRAINT \`CHK_orders_discount_non_negative\`
        CHECK (\`discount\` >= 0),
      ADD CONSTRAINT \`CHK_orders_shipping_fee_non_negative\`
        CHECK (\`shipping_fee\` >= 0)
    `);

    await queryRunner.query(`
      ALTER TABLE \`order_items\`
      ADD CONSTRAINT \`CHK_order_items_quantity_positive\`
        CHECK (\`quantity\` > 0),
      ADD CONSTRAINT \`CHK_order_items_unit_price_non_negative\`
        CHECK (\`unit_price\` >= 0)
    `);
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
