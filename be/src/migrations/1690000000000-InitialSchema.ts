import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1690000000000 implements MigrationInterface {
  name = 'InitialSchema1690000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        passwordHashed VARCHAR(255) NOT NULL,
        role ENUM('CUSTOMER','SHOP') NOT NULL DEFAULT 'CUSTOMER',
        createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS shops (
        id INT PRIMARY KEY AUTO_INCREMENT,
        description VARCHAR(255) NULL,
        address VARCHAR(255) NULL,
        user_id INT NULL,
        CONSTRAINT FK_shops_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
        type VARCHAR(255) NOT NULL,
        url VARCHAR(255) NOT NULL,
        createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        user_id INT NULL,
        CONSTRAINT FK_photos_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(255) NOT NULL,
        description VARCHAR(255) NULL,
        stock INT NOT NULL,
        price INT NOT NULL,
        isActive TINYINT NOT NULL DEFAULT 1,
        createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) NULL DEFAULT NULL,
        shop_id INT NOT NULL,
        CONSTRAINT FK_products_shop FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE CASCADE
      ) ENGINE=InnoDB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS products;`);
    await queryRunner.query(`DROP TABLE IF EXISTS photos;`);
    await queryRunner.query(`DROP TABLE IF EXISTS shops;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
  }
}
