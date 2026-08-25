import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFKUQIDX1787558255859 implements MigrationInterface {
  name = 'AddFKUQIDX1787558255859';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`FK_user_photos_user_id\` ON \`user_photos\``,
    );
    await queryRunner.query(`DROP INDEX \`UQ_roles_name\` ON \`roles\``);
    await queryRunner.query(`DROP INDEX \`UQ_users_email\` ON \`users\``);
    await queryRunner.query(
      `ALTER TABLE \`product_photos\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_categories_parent_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_categories\` DROP FOREIGN KEY \`FK_product_categories_category_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_orders_recipient_address_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_addresses\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_order_items_order_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`order_code\` \`order_code\` varchar(36) NOT NULL DEFAULT '() => randomUUID()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD UNIQUE INDEX \`IDX_e462c2f2237b3049aa6be3fce0\` (\`order_code\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_order_items_variant_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` DROP FOREIGN KEY \`FK_cart_items_variant_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_photos\` DROP FOREIGN KEY \`FK_product_photos_product_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_categories\` DROP FOREIGN KEY \`FK_product_categories_product_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_orders_shop_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_products_shop_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`shops\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`shops\` ADD UNIQUE INDEX \`IDX_28bfe98246df262c24ecb64568\` (\`shop_name\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_photos\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_user_roles_role_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`roles\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`roles\` ADD UNIQUE INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` (\`name\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_addresses\` DROP FOREIGN KEY \`FK_user_addresses_user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_orders_user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`shops\` DROP FOREIGN KEY \`FK_shops_user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_user_roles_user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`UQ_product_id_size_color\` ON \`product_variants\` (\`product_id\`, \`size\`, \`color\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_bb9c758dcc60137e56f6fee72f\` ON \`shops\` (\`user_id\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_bb9c758dcc60137e56f6fee72f\` ON \`shops\` (\`user_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_photos\` ADD CONSTRAINT \`FK_product_photos_product_id\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_categories_parent_id\` FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_categories\` ADD CONSTRAINT \`FK_product_categories_product_id\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_categories\` ADD CONSTRAINT \`FK_product_categories_category_id\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_addresses\` ADD CONSTRAINT \`FK_user_addresses_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_orders_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_orders_shop_id\` FOREIGN KEY (\`shop_id\`) REFERENCES \`shops\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_orders_recipient_address_id\` FOREIGN KEY (\`recipient_address_id\`) REFERENCES \`user_addresses\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_order_items_order_id\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_order_items_variant_id\` FOREIGN KEY (\`variant_id\`) REFERENCES \`product_variants\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` ADD CONSTRAINT \`FK_product_variants_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` ADD CONSTRAINT \`FK_products_shop_id\` FOREIGN KEY (\`shop_id\`) REFERENCES \`shops\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`shops\` ADD CONSTRAINT \`FK_shops_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_photos\` ADD CONSTRAINT \`FK_user_photos_user-id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_user_roles_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_user_roles_role_id\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` ADD CONSTRAINT \`FK_b7213c20c1ecdc6597abc8f1212\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` ADD CONSTRAINT \`FK_cart_items_variant_id\` FOREIGN KEY (\`variant_id\`) REFERENCES \`product_variants\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` DROP FOREIGN KEY \`FK_cart_items_variant_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` DROP FOREIGN KEY \`FK_b7213c20c1ecdc6597abc8f1212\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_user_roles_role_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_user_roles_user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_photos\` DROP FOREIGN KEY \`FK_user_photos_user-id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`shops\` DROP FOREIGN KEY \`FK_shops_user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_products_shop_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` DROP FOREIGN KEY \`FK_product_variants_product\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_order_items_variant_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_order_items_order_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_orders_recipient_address_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_orders_shop_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_orders_user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_addresses\` DROP FOREIGN KEY \`FK_user_addresses_user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_categories\` DROP FOREIGN KEY \`FK_product_categories_category_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_categories\` DROP FOREIGN KEY \`FK_product_categories_product_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_categories_parent_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_photos\` DROP FOREIGN KEY \`FK_product_photos_product_id\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_bb9c758dcc60137e56f6fee72f\` ON \`shops\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_bb9c758dcc60137e56f6fee72f\` ON \`shops\``,
    );
    await queryRunner.query(
      `DROP INDEX \`UQ_product_id_size_color\` ON \`product_variants\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_user_roles_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`shops\` ADD CONSTRAINT \`FK_shops_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_orders_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_addresses\` ADD CONSTRAINT \`FK_user_addresses_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`roles\` DROP INDEX \`IDX_648e3f5447f725579d7d4ffdfb\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`roles\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_user_roles_role_id\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_photos\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`shops\` DROP INDEX \`IDX_28bfe98246df262c24ecb64568\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`shops\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` ADD CONSTRAINT \`FK_products_shop_id\` FOREIGN KEY (\`shop_id\`) REFERENCES \`shops\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_orders_shop_id\` FOREIGN KEY (\`shop_id\`) REFERENCES \`shops\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_categories\` ADD CONSTRAINT \`FK_product_categories_product_id\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_photos\` ADD CONSTRAINT \`FK_product_photos_product_id\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` ADD CONSTRAINT \`FK_cart_items_variant_id\` FOREIGN KEY (\`variant_id\`) REFERENCES \`product_variants\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_order_items_variant_id\` FOREIGN KEY (\`variant_id\`) REFERENCES \`product_variants\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP INDEX \`IDX_e462c2f2237b3049aa6be3fce0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`order_code\` \`order_code\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_order_items_order_id\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_addresses\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_orders_recipient_address_id\` FOREIGN KEY (\`recipient_address_id\`) REFERENCES \`user_addresses\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_categories\` ADD CONSTRAINT \`FK_product_categories_category_id\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_categories_parent_id\` FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_photos\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`UQ_users_email\` ON \`users\` (\`email\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`UQ_roles_name\` ON \`roles\` (\`name\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`FK_user_photos_user_id\` ON \`user_photos\` (\`user_id\`)`,
    );
  }
}
