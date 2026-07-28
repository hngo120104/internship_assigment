CREATE DATABASE IF NOT EXISTS `internship_assignment` CHARACTER
SET
    utf8mb4 COLLATE utf8mb4_0900_ai_ci;

USE `internship_assignment`;

CREATE TABLE
    `roles` (
        `id` INT AUTO_INCREMENT,
        `name` varchar(255) NOT NULL DEFAULT 'CUSTOMER' UNIQUE,
        `description` VARCHAR(255) DEFAULT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `UQ_roles_name` (`name`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
    `users` (
        `id` varchar(36) NOT NULL,
        `user_name` varchar(255) NOT NULL,
        `email` varchar(255) NOT NULL,
        `password_hashed` varchar(255) NOT NULL,
        `created_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        `updated_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        `is_deleted` tinyint (1) NOT NULL DEFAULT 0,
        PRIMARY KEY (`id`),
        UNIQUE KEY `UQ_users_email` (`email`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
    IF NOT EXISTS `user_roles` (
        `user_id` VARCHAR(36) NOT NULL,
        `role_id` INT NOT NULL,
        PRIMARY KEY (`user_id`, `role_id`), -- Tránh 1 user bị gán trùng 1 role nhiều lần
        CONSTRAINT `FK_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
        CONSTRAINT `FK_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
    `user_addresses` (
        `id` varchar(36) NOT NULL,
        `user_id` varchar(36) NOT NULL,
        `recipient_name` varchar(255) NOT NULL,
        `phone_number` varchar(10) NOT NULL,
        `province` varchar(255) NOT NULL,
        `district` varchar(255) NOT NULL,
        `address_line` varchar(1000) NOT NULL,
        `is_primary` tinyint (1) NOT NULL DEFAULT 1,
        `created_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        `updated_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        `is_deleted` tinyint (1) NOT NULL DEFAULT 0,
        PRIMARY KEY (`id`),
        CONSTRAINT `FK_address_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
    `user_photos` (
        `id` varchar(36) NOT NULL,
        `user_id` varchar(36) NOT NULL,
        `type` enum ('AVATAR', 'BACKGROUND') NOT NULL,
        `url` varchar(2048) NOT NULL,
        `created_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        `updated_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        `is_deleted` tinyint (1) NOT NULL DEFAULT 0,
        PRIMARY KEY (`id`),
        KEY `IDX_photos_user_id` (`user_id`),
        CONSTRAINT `FK_user_photos_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;


CREATE TABLE
    `shops` (
        `id` varchar(36) NOT NULL,
        `user_id` varchar(36) NOT NULL,
        `shop_name` varchar(255) NOT NULL,
        `description` varchar(255) DEFAULT NULL,
        `address` varchar(255) DEFAULT NULL,
        `created_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        `updated_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        `is_deleted` tinyint (1) NOT NULL DEFAULT 0,
        `shop_status` enum ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
        PRIMARY KEY (`id`),
        UNIQUE KEY `UQ_shops_shop_name` (`shop_name`),
        UNIQUE KEY `UQ_shop_user` (`user_id`),
        CONSTRAINT `FK_shops_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
    `shop_photos` (
        `id` varchar(36) NOT NULL,
        `shop_id` varchar(36) NOT NULL,
        `type` enum ('AVATAR', 'BACKGROUND') NOT NULL,
        `url` varchar(2048) NOT NULL,
        `created_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        `updated_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        `is_deleted` tinyint (1) NOT NULL DEFAULT 0,
        PRIMARY KEY (`id`),
        KEY `IDX_photos_shop_id` (`shop_id`),
        CONSTRAINT `FK_shop_photos_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE RESTRICT
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
    `categories` (
        `id` varchar(36) NOT NULL,
        `icon_url` varchar(2048) DEFAULT NULL,
        `name` varchar(255) NOT NULL,
        `description` text DEFAULT NULL,
        `parent_id` varchar(36) DEFAULT NULL,
        `is_active` tinyint (1) NOT NULL DEFAULT 1,
        PRIMARY KEY (`id`),
        CONSTRAINT `FK_parent_category` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
    `products` (
        `id` varchar(36) NOT NULL,
        `shop_id` varchar(36) NOT NULL,
        `name` varchar(255) NOT NULL,
        `description` text DEFAULT NULL,
        `stock` int NOT NULL DEFAULT 0,
        `price` decimal(12, 2) NOT NULL,
        `is_active` tinyint (1) NOT NULL DEFAULT 1,
        `created_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        `updated_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        `is_deleted` tinyint (1) NOT NULL DEFAULT 0,
        `category_id` varchar(36) NOT NULL,
        PRIMARY KEY (`id`),
        KEY `IDX_products_shops_id` (`shop_id`),
        KEY `IDX_products_category_id` (`category_id`),
        CONSTRAINT `FK_products_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE RESTRICT,
        CONSTRAINT `CHK_products_stock_non_negative` CHECK (`stock` >= 0),
        CONSTRAINT `CHK_products_price_non_negative` CHECK (`price` >= 0),
        CONSTRAINT `FK_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
    `product_photos` (
        `id` varchar(36) NOT NULL,
        `product_id` varchar(36) NOT NULL,
        `url` varchar(2048) NOT NULL,
        `description` text DEFAULT NULL,
        `is_primary` tinyint (1) DEFAULT 0,
        `created_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        `updated_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        `is_deleted` tinyint (1) NOT NULL DEFAULT 0,
        PRIMARY KEY (`id`),
        KEY `IDX_photos_product_id` (`product_id`),
        CONSTRAINT `FK_photos_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
    `carts` (
        `id` varchar(36) NOT NULL,
        `guest_id` varchar(50) DEFAULT NULL,
        `user_id` varchar(36) DEFAULT NULL,
        `cart_status` enum ('ACTIVE', 'ORDERED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
        `created_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        `updated_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
        PRIMARY KEY (`id`),
        UNIQUE KEY `UQ_cart_guest` (`guest_id`),
        CONSTRAINT `FK_carts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
        CONSTRAINT `CHK_carts_exactly_one_owner` CHECK (
            (
                `user_id` IS NOT NULL
                AND `guest_id` IS NULL
            )
            OR (
                `user_id` IS NULL
                AND `guest_id` IS NOT NULL
            )
        )
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
    `cart_items` (
        `id` int NOT NULL AUTO_INCREMENT,
        `cart_id` varchar(36) NOT NULL,
        `product_id` varchar(36) NOT NULL,
        `quantity` int NOT NULL DEFAULT 1,
        `created_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        `updated_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
        PRIMARY KEY (`id`),
        UNIQUE KEY `UQ_cart_items_cart_product` (`cart_id`, `product_id`),
        KEY `IDX_cart_items_product_id` (`product_id`),
        CONSTRAINT `FK_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE RESTRICT,
        CONSTRAINT `FK_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
        CONSTRAINT `CHK_cart_items_quantity_positive` CHECK (`quantity` > 0)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;