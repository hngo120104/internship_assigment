CREATE DATABASE IF NOT EXISTS `internship_assignment` CHARACTER
SET
    utf8mb4 COLLATE utf8mb4_0900_ai_ci;

USE `internship_assignment`;

CREATE TABLE
    `roles` (
        `id` varchar(36) NOT NULL DEFAULT (UUID ()),
        `name` varchar(255) NOT NULL DEFAULT 'CUSTOMER' UNIQUE,
        `description` VARCHAR(255) DEFAULT NULL,
        PRIMARY KEY (`id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
    `users` (
        `id` varchar(36) NOT NULL DEFAULT (UUID ()),
        `user_name` varchar(255) NOT NULL,
        `email` varchar(255) NOT NULL,
        `password_hashed` varchar(255) NOT NULL,
        `created_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        `updated_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        `user_status` enum ('ACTIVE', 'BANNED') NOT NULL DEFAULT 'ACTIVE',
        `is_deleted` tinyint (1) NOT NULL DEFAULT 0,
        PRIMARY KEY (`id`),
        UNIQUE KEY `UQ_users_email` (`email`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
    IF NOT EXISTS `user_roles` (
        `user_id` varchar(36) NOT NULL,
        `role_id` varchar(36) NOT NULL,
        `is_deleted` tinyint (1) DEFAULT NULL,
        PRIMARY KEY (`user_id`, `role_id`), -- Tránh 1 user bị gán trùng 1 role nhiều lần
        CONSTRAINT `FK_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
        CONSTRAINT `FK_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
    `user_addresses` (
        `id` varchar(36) NOT NULL DEFAULT (UUID ()),
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
        `id` varchar(36) NOT NULL DEFAULT (UUID ()),
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
        `id` varchar(36) NOT NULL DEFAULT (UUID ()),
        `user_id` varchar(36) NOT NULL,
        `shop_name` varchar(255) NOT NULL,
        `description` varchar(255) DEFAULT NULL,
        `address` varchar(255) DEFAULT NULL,
        `created_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        `updated_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        `is_deleted` tinyint (1) NOT NULL DEFAULT 0,
        `shop_status` enum ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED') NOT NULL DEFAULT 'ACTIVE',
        PRIMARY KEY (`id`),
        UNIQUE KEY `UQ_shops_shop_name` (`shop_name`),
        UNIQUE KEY `UQ_shop_user` (`user_id`),
        CONSTRAINT `FK_shops_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
    `shop_photos` (
        `id` varchar(36) NOT NULL DEFAULT (UUID ()),
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
        `id` varchar(36) NOT NULL DEFAULT (UUID ()),
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
        `id` varchar(36) NOT NULL DEFAULT (UUID ()),
        `shop_id` varchar(36) NOT NULL,
        `name` varchar(255) NOT NULL,
        `description` text DEFAULT NULL,
        `amount` int NOT NULL DEFAULT 0,
        `price` decimal(12, 2) NOT NULL,
        `is_active` tinyint (1) NOT NULL DEFAULT 1,
        `created_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        `updated_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        `is_deleted` tinyint (1) NOT NULL DEFAULT 0,
        PRIMARY KEY (`id`),
        KEY `IDX_products_shops_id` (`shop_id`),
        CONSTRAINT `FK_products_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE RESTRICT,
        CONSTRAINT `CHK_products_amount_non_negative` CHECK (`amount` >= 0),
        CONSTRAINT `CHK_products_price_non_negative` CHECK (`price` >= 0)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE Table
    `product_categories` (
        `product_id` varchar(36) NOT NULL,
        `category_id` varchar(36) NOT NULL,
        `is_deleted` tinyint (1) DEFAULT NULL,
        PRIMARY KEY (`product_id`, `category_id`),
        KEY `IDX_product_categories_category_id` (`category_id`),
        CONSTRAINT `FK_product_categories_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
        CONSTRAINT `FK_product_categories_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
    `product_photos` (
        `id` varchar(36) NOT NULL DEFAULT (UUID ()),
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
    `cart_items` (
        `id` varchar(36) NOT NULL DEFAULT (UUID ()),
        `user_id` varchar(36) NOT NULL,
		`product_id` varchar(36) NOT NULL,
        `cart_item_status` enum ('ACTIVE', 'ORDERED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
        `quantity` INTEGER NOT NULL DEFAULT 1,
        `created_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        `updated_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        `is_deleted` tinyint (1) NOT NULL DEFAULT 0,
        PRIMARY KEY (`id`),
        UNIQUE KEY `UQ_cart_user` (`user_id`),
        CONSTRAINT `FK_cart_items_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
        CONSTRAINT `FK_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
        CONSTRAINT `CHK_cart_items_quantity_non_negative` CHECK (`quantity` > 0)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
    `orders` (
        `id` varchar(36) NOT NULL DEFAULT (UUID ()),
        `user_id` varchar(36) NOT NULL,
        `shop_id` varchar(36) NOT NULL,
        `recipient_address_id` varchar(36) NOT NULL,
        `order_code` varchar(36) NOT NULL DEFAULT (UUID ()),
        `order_status` enum (
            'PENDING',
            'CONFIRMED',
            'PROCESSING',
            'SHIPPING',
            'DELIVERED',
            'CANCELLED'
        ) NOT NULL DEFAULT 'PENDING',
        `payment_status` enum ('PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
        `payment_method` enum ('COD', 'BANKING') NOT NULL DEFAULT 'COD',
        `discount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
        `shipping_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0,
        `created_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        `updated_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (`id`),
        UNIQUE KEY `UQ_orders_order_code` (`order_code`),
        CONSTRAINT `FK_orders_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
        CONSTRAINT `FK_orders_shop` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE RESTRICT,
        CONSTRAINT `FK_orders_ship_address` FOREIGN KEY (`recipient_address_id`) REFERENCES `user_addresses` (`id`) ON DELETE RESTRICT,
        CONSTRAINT `CHK_orders_discount_non_negative` CHECK (`discount` >= 0),
        CONSTRAINT `CHK_orders_shipping_fee_non_negative` CHECK (`shipping_fee` >= 0),
        KEY `IDX_orders_shop_id` (`shop_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE
    `order_items` (
        `id` varchar(36) NOT NULL DEFAULT (UUID ()),
        `order_id` varchar(36) NOT NULL,
        `product_id` varchar(36) NOT NULL,
        `product_name` varchar(255) NOT NULL,
        `unit_price` DECIMAL(12, 2) NOT NULL,
        `quantity` int NOT NULL DEFAULT 1,
        `note` varchar(1000) DEFAULT NULL,
        `created_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        `updated_at` datetime (6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (`id`),
        UNIQUE KEY `UQ_order_items_order_product` (`order_id`, `product_id`),
        CONSTRAINT `FK_order_items_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
        CONSTRAINT `FK_order_items_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT,
        CONSTRAINT `CHK_order_items_quantity_positive` CHECK (`quantity` > 0),
        CONSTRAINT `CHK_order_items_unit_price_non_negative` CHECK (`unit_price` >= 0),
        KEY `IDX_order_items_product_id` (`product_id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
    
drop table cart_items;
    
