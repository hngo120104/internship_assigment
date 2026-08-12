import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentMethodToOrders1786518000000 implements MigrationInterface {
  name = 'AddPaymentMethodToOrders1786518000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const ordersTable = await queryRunner.getTable('orders');
    if (!ordersTable || ordersTable.findColumnByName('payment_method')) return;

    await queryRunner.query(`
      ALTER TABLE \`orders\`
      ADD COLUMN \`payment_method\`
        ENUM('COD', 'BANKING')
        NOT NULL DEFAULT 'COD'
        AFTER \`payment_status\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const ordersTable = await queryRunner.getTable('orders');
    if (!ordersTable?.findColumnByName('payment_method')) return;

    await queryRunner.query(`
      ALTER TABLE \`orders\`
      DROP COLUMN \`payment_method\`
    `);
  }
}
