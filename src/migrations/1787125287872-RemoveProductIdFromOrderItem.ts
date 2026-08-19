import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveProductIdFromOrderItem1787125287872 implements MigrationInterface {
  name = 'RemoveProductIdFromOrderItem1787125287872';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`product_photos\` DROP FOREIGN KEY \`FK_photos_product\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_parent_category\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_categories\` DROP FOREIGN KEY \`FK_product_categories_category\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_categories\` DROP FOREIGN KEY \`FK_product_categories_product\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_addresses\` DROP FOREIGN KEY \`FK_address_user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_orders_ship_address\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_orders_shop\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_orders_user_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_order_items_order_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_order_items_product_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_products_shop\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`shops\` DROP FOREIGN KEY \`FK_shops_user\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_photos\` DROP FOREIGN KEY \`FK_user_photos_user\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_user_roles_role\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_user_roles_user\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` DROP FOREIGN KEY \`FK_cart_items_user\``,
    );
    await queryRunner.query(
      `DROP INDEX \`UQ_orders_order_code\` ON \`orders\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_order_items_product_id\` ON \`order_items\``,
    );
    await queryRunner.query(`DROP INDEX \`UQ_shop_user\` ON \`shops\``);
    await queryRunner.query(`DROP INDEX \`UQ_shops_shop_name\` ON \`shops\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_photos_user_id\` ON \`user_photos\``,
    );
    await queryRunner.query(`DROP INDEX \`name\` ON \`roles\``);
    await queryRunner.query(`DROP INDEX \`UQ_users_email\` ON \`users\``);
    await queryRunner.query(
      `ALTER TABLE \`product_categories\` DROP COLUMN \`is_deleted\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP COLUMN \`product_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_photos\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_addresses\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` CHANGE \`order_code\` \`order_code\` varchar(36) NULL`,
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
      `ALTER TABLE \`cart_items\` DROP FOREIGN KEY \`FK_cart_items_variant\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` DROP FOREIGN KEY \`FK_product_variants_product\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`shops\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`shops\` ADD UNIQUE INDEX \`IDX_28bfe98246df262c24ecb64568\` (\`shop_name\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`shops\` ADD UNIQUE INDEX \`IDX_bb9c758dcc60137e56f6fee72f\` (\`user_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_photos\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`roles\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`roles\` ADD UNIQUE INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` (\`name\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` CHANGE \`is_deleted\` \`is_deleted\` tinyint NOT NULL`,
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
      `ALTER TABLE \`cart_items\` CHANGE \`quantity\` \`quantity\` int NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_d13671f99779f6bb0c2cd9023f\` ON \`product_variants\` (\`product_id\`, \`size\`, \`color\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`REL_bb9c758dcc60137e56f6fee72f\` ON \`shops\` (\`user_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_photos\` ADD CONSTRAINT \`FK_ef0be6cd13fe604b1e7ae5987b8\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_88cea2dc9c31951d06437879b40\` FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_categories\` ADD CONSTRAINT \`FK_8748b4a0e8de6d266f2bbc877f6\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_categories\` ADD CONSTRAINT \`FK_9148da8f26fc248e77a387e3112\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_addresses\` ADD CONSTRAINT \`FK_7a5100ce0548ef27a6f1533a5ce\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_a922b820eeef29ac1c6800e826a\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_33f20db82908f7685a5c0c58ac6\` FOREIGN KEY (\`shop_id\`) REFERENCES \`shops\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_9f7de0c60791a3a5e095bb56300\` FOREIGN KEY (\`recipient_address_id\`) REFERENCES \`user_addresses\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_145532db85752b29c57d2b7b1f1\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_order_items_variant_id\` FOREIGN KEY (\`variant_id\`) REFERENCES \`product_variants\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` ADD CONSTRAINT \`FK_product_variants_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` ADD CONSTRAINT \`FK_9e952e93f369f16e27dd786c33f\` FOREIGN KEY (\`shop_id\`) REFERENCES \`shops\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`shops\` ADD CONSTRAINT \`FK_bb9c758dcc60137e56f6fee72f7\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_photos\` ADD CONSTRAINT \`FK_1faff88f0aaaa07a7c1fec2d5c4\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_87b8888186ca9769c960e926870\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_b23c65e50a758245a33ee35fda1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` ADD CONSTRAINT \`FK_b7213c20c1ecdc6597abc8f1212\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` ADD CONSTRAINT \`FK_cart_items_variant\` FOREIGN KEY (\`variant_id\`) REFERENCES \`product_variants\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` DROP FOREIGN KEY \`FK_cart_items_variant\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` DROP FOREIGN KEY \`FK_b7213c20c1ecdc6597abc8f1212\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_b23c65e50a758245a33ee35fda1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_87b8888186ca9769c960e926870\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_photos\` DROP FOREIGN KEY \`FK_1faff88f0aaaa07a7c1fec2d5c4\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`shops\` DROP FOREIGN KEY \`FK_bb9c758dcc60137e56f6fee72f7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_9e952e93f369f16e27dd786c33f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` DROP FOREIGN KEY \`FK_product_variants_product\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_order_items_variant_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_145532db85752b29c57d2b7b1f1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_9f7de0c60791a3a5e095bb56300\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_33f20db82908f7685a5c0c58ac6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_a922b820eeef29ac1c6800e826a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_addresses\` DROP FOREIGN KEY \`FK_7a5100ce0548ef27a6f1533a5ce\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_categories\` DROP FOREIGN KEY \`FK_9148da8f26fc248e77a387e3112\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_categories\` DROP FOREIGN KEY \`FK_8748b4a0e8de6d266f2bbc877f6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_88cea2dc9c31951d06437879b40\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_photos\` DROP FOREIGN KEY \`FK_ef0be6cd13fe604b1e7ae5987b8\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_bb9c758dcc60137e56f6fee72f\` ON \`shops\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_d13671f99779f6bb0c2cd9023f\` ON \`product_variants\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` CHANGE \`quantity\` \`quantity\` int NOT NULL DEFAULT '1'`,
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
      `ALTER TABLE \`user_roles\` CHANGE \`is_deleted\` \`is_deleted\` tinyint NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`roles\` DROP INDEX \`IDX_648e3f5447f725579d7d4ffdfb\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`roles\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_photos\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`shops\` DROP INDEX \`IDX_bb9c758dcc60137e56f6fee72f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`shops\` DROP INDEX \`IDX_28bfe98246df262c24ecb64568\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`shops\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` ADD CONSTRAINT \`FK_product_variants_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_variants\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` ADD CONSTRAINT \`FK_cart_items_variant\` FOREIGN KEY (\`variant_id\`) REFERENCES \`product_variants\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
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
      `ALTER TABLE \`user_addresses\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_photos\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD \`product_id\` varchar(36) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_categories\` ADD \`is_deleted\` tinyint NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`UQ_users_email\` ON \`users\` (\`email\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`name\` ON \`roles\` (\`name\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_photos_user_id\` ON \`user_photos\` (\`user_id\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`UQ_shops_shop_name\` ON \`shops\` (\`shop_name\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`UQ_shop_user\` ON \`shops\` (\`user_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_order_items_product_id\` ON \`order_items\` (\`product_id\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`UQ_orders_order_code\` ON \`orders\` (\`order_code\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`cart_items\` ADD CONSTRAINT \`FK_cart_items_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_user_roles_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_user_roles_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_photos\` ADD CONSTRAINT \`FK_user_photos_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`shops\` ADD CONSTRAINT \`FK_shops_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`products\` ADD CONSTRAINT \`FK_products_shop\` FOREIGN KEY (\`shop_id\`) REFERENCES \`shops\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_order_items_product_id\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_order_items_order_id\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_orders_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_orders_shop\` FOREIGN KEY (\`shop_id\`) REFERENCES \`shops\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_orders_ship_address\` FOREIGN KEY (\`recipient_address_id\`) REFERENCES \`user_addresses\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_addresses\` ADD CONSTRAINT \`FK_address_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_categories\` ADD CONSTRAINT \`FK_product_categories_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_categories\` ADD CONSTRAINT \`FK_product_categories_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_parent_category\` FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`product_photos\` ADD CONSTRAINT \`FK_photos_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
}
