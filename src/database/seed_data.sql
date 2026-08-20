-- Seed data for internship_assignment (MySQL 8+)
-- Accounts:
--   customer01@gmail.com .. customer03@gmail.com / Customer123!
--   seller01@gmail.com   .. seller03@gmail.com   / Seller123!
--   admin@gmail.com                            / Admin123!
--
-- The fixed UUIDs and ON DUPLICATE KEY clauses make this file safe to rerun.

SET NAMES utf8mb4;
USE `internship_assignment`;

START TRANSACTION;

-- ---------------------------------------------------------------------------
-- Roles
-- ---------------------------------------------------------------------------
INSERT INTO `roles` (`id`, `name`, `description`)
VALUES
    ('00000000-0000-4000-8000-000000000001', 'CUSTOMER', 'Customer role'),
    ('00000000-0000-4000-8000-000000000002', 'SELLER', 'Seller role'),
    ('00000000-0000-4000-8000-000000000003', 'ADMIN', 'Admin role')
ON DUPLICATE KEY UPDATE
    `description` = VALUES(`description`);

SET @customer_role_id = (SELECT `id` FROM `roles` WHERE `name` = 'CUSTOMER' LIMIT 1);
SET @seller_role_id = (SELECT `id` FROM `roles` WHERE `name` = 'SELLER' LIMIT 1);
SET @admin_role_id = (SELECT `id` FROM `roles` WHERE `name` = 'ADMIN' LIMIT 1);

-- ---------------------------------------------------------------------------
-- Users (passwords are bcrypt hashes with cost 12)
-- ---------------------------------------------------------------------------
INSERT INTO `users`
    (`id`, `user_name`, `email`, `password_hashed`, `user_status`, `is_deleted`)
VALUES
    ('10000000-0000-4000-8000-000000000001', 'customer01', 'customer01@gmail.com', '$2b$12$M66tMGMr4OwXRY.bDK9tL.3MwQJVTS4mwa1T2ohMZipJxAjrCiu4C', 'ACTIVE', 0),
    ('10000000-0000-4000-8000-000000000002', 'customer02', 'customer02@gmail.com', '$2b$12$M66tMGMr4OwXRY.bDK9tL.3MwQJVTS4mwa1T2ohMZipJxAjrCiu4C', 'ACTIVE', 0),
    ('10000000-0000-4000-8000-000000000003', 'customer03', 'customer03@gmail.com', '$2b$12$M66tMGMr4OwXRY.bDK9tL.3MwQJVTS4mwa1T2ohMZipJxAjrCiu4C', 'ACTIVE', 0),
    ('10000000-0000-4000-8000-000000000011', 'seller01', 'seller01@gmail.com', '$2b$12$FM5u61RbJYs7PXiWl2yKw.zapdWxrS0P.XT1wUHs8NluolauEMYWy', 'ACTIVE', 0),
    ('10000000-0000-4000-8000-000000000012', 'seller02', 'seller02@gmail.com', '$2b$12$FM5u61RbJYs7PXiWl2yKw.zapdWxrS0P.XT1wUHs8NluolauEMYWy', 'ACTIVE', 0),
    ('10000000-0000-4000-8000-000000000013', 'seller03', 'seller03@gmail.com', '$2b$12$FM5u61RbJYs7PXiWl2yKw.zapdWxrS0P.XT1wUHs8NluolauEMYWy', 'ACTIVE', 0),
    ('10000000-0000-4000-8000-000000000099', 'admin', 'admin@gmail.com', '$2b$12$Dj2wPzYtHEYBwFVoobEryOuzlylHt0XAg1kI3bi3aY1bYKJ.b6qwO', 'ACTIVE', 0)
ON DUPLICATE KEY UPDATE
    `user_name` = VALUES(`user_name`),
    `password_hashed` = VALUES(`password_hashed`),
    `user_status` = 'ACTIVE',
    `is_deleted` = 0;

SET @customer_01_id = (SELECT `id` FROM `users` WHERE `email` = 'customer01@gmail.com' LIMIT 1);
SET @customer_02_id = (SELECT `id` FROM `users` WHERE `email` = 'customer02@gmail.com' LIMIT 1);
SET @customer_03_id = (SELECT `id` FROM `users` WHERE `email` = 'customer03@gmail.com' LIMIT 1);
SET @seller_01_id = (SELECT `id` FROM `users` WHERE `email` = 'seller01@gmail.com' LIMIT 1);
SET @seller_02_id = (SELECT `id` FROM `users` WHERE `email` = 'seller02@gmail.com' LIMIT 1);
SET @seller_03_id = (SELECT `id` FROM `users` WHERE `email` = 'seller03@gmail.com' LIMIT 1);
SET @admin_id = (SELECT `id` FROM `users` WHERE `email` = 'admin@gmail.com' LIMIT 1);

INSERT INTO `user_roles` (`user_id`, `role_id`, `is_deleted`)
VALUES
    (@customer_01_id, @customer_role_id, 0),
    (@customer_02_id, @customer_role_id, 0),
    (@customer_03_id, @customer_role_id, 0),
    (@seller_01_id, @seller_role_id, 0),
    (@seller_02_id, @seller_role_id, 0),
    (@seller_03_id, @seller_role_id, 0),
    (@admin_id, @admin_role_id, 0)
ON DUPLICATE KEY UPDATE
    `is_deleted` = 0;

-- ---------------------------------------------------------------------------
-- Seller shops
-- ---------------------------------------------------------------------------
INSERT INTO `shops`
    (`id`, `user_id`, `shop_name`, `description`, `address`, `shop_status`, `is_deleted`)
VALUES
    ('20000000-0000-4000-8000-000000000001', @seller_01_id, 'Urban Style Shop', 'Thời trang và phụ kiện hằng ngày', 'Quận 1, TP. Hồ Chí Minh', 'ACTIVE', 0),
    ('20000000-0000-4000-8000-000000000002', @seller_02_id, 'Pro Gaming Store', 'Gaming gear chính hãng', 'Quận Cầu Giấy, Hà Nội', 'ACTIVE', 0),
    ('20000000-0000-4000-8000-000000000003', @seller_03_id, 'Happy Corner', 'Đồ chơi và văn phòng phẩm', 'Quận Hải Châu, Đà Nẵng', 'ACTIVE', 0)
ON DUPLICATE KEY UPDATE
    `description` = VALUES(`description`),
    `address` = VALUES(`address`),
    `shop_status` = 'ACTIVE',
    `is_deleted` = 0;

SET @shop_01_id = (SELECT `id` FROM `shops` WHERE `user_id` = @seller_01_id LIMIT 1);
SET @shop_02_id = (SELECT `id` FROM `shops` WHERE `user_id` = @seller_02_id LIMIT 1);
SET @shop_03_id = (SELECT `id` FROM `shops` WHERE `user_id` = @seller_03_id LIMIT 1);

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
INSERT INTO `categories`
    (`id`, `icon_url`, `name`, `description`, `parent_id`, `is_active`)
VALUES
    ('30000000-0000-4000-8000-000000000001', NULL, 'Quần áo', 'Quần áo và phụ kiện thời trang', NULL, 1),
    ('30000000-0000-4000-8000-000000000002', NULL, 'Gaming Gear', 'Thiết bị và phụ kiện chơi game', NULL, 1),
    ('30000000-0000-4000-8000-000000000003', NULL, 'Đồ chơi', 'Đồ chơi giải trí và giáo dục', NULL, 1),
    ('30000000-0000-4000-8000-000000000004', NULL, 'Văn phòng phẩm', 'Dụng cụ học tập và văn phòng', NULL, 1)
ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `description` = VALUES(`description`),
    `is_active` = 1;

-- ---------------------------------------------------------------------------
-- Products: 4 products/category, distributed across the 3 seller shops
-- ---------------------------------------------------------------------------
INSERT INTO `products`
    (`id`, `shop_id`, `name`, `description`, `is_active`, `is_deleted`)
VALUES
    -- Quần áo - Urban Style Shop
    ('40000000-0000-4000-8000-000000000001', @shop_01_id, 'Áo thun cotton basic', 'Áo thun cotton mềm, thoáng mát, phù hợp mặc hằng ngày.', 1, 0),
    ('40000000-0000-4000-8000-000000000002', @shop_01_id, 'Áo hoodie unisex', 'Hoodie nỉ unisex form rộng, giữ ấm tốt.', 1, 0),
    ('40000000-0000-4000-8000-000000000003', @shop_01_id, 'Quần jean slim fit', 'Quần jean co giãn nhẹ, kiểu dáng slim fit.', 1, 0),
    ('40000000-0000-4000-8000-000000000004', @shop_01_id, 'Áo sơ mi Oxford', 'Áo sơ mi Oxford lịch sự, dễ phối đồ.', 1, 0),

    -- Gaming Gear - Pro Gaming Store
    ('40000000-0000-4000-8000-000000000011', @shop_02_id, 'Chuột gaming RGB G1', 'Chuột gaming 6 nút, cảm biến chính xác và đèn RGB.', 1, 0),
    ('40000000-0000-4000-8000-000000000012', @shop_02_id, 'Bàn phím cơ TKL K87', 'Bàn phím cơ layout TKL với switch tactile.', 1, 0),
    ('40000000-0000-4000-8000-000000000013', @shop_02_id, 'Tai nghe gaming H7', 'Tai nghe gaming âm thanh vòm, micro chống ồn.', 1, 0),
    ('40000000-0000-4000-8000-000000000014', @shop_02_id, 'Lót chuột gaming XXL', 'Lót chuột khổ lớn, bề mặt điều khiển mượt.', 1, 0),

    -- Đồ chơi - Happy Corner
    ('40000000-0000-4000-8000-000000000021', @shop_03_id, 'Bộ xếp hình thành phố', 'Bộ xếp hình sáng tạo 500 chi tiết.', 1, 0),
    ('40000000-0000-4000-8000-000000000022', @shop_03_id, 'Xe điều khiển địa hình', 'Xe điều khiển từ xa có khả năng vượt địa hình.', 1, 0),
    ('40000000-0000-4000-8000-000000000023', @shop_03_id, 'Gấu bông thỏ trắng', 'Gấu bông mềm mại, kích thước 40 cm.', 1, 0),
    ('40000000-0000-4000-8000-000000000024', @shop_03_id, 'Bộ cờ vua nam châm', 'Bộ cờ vua gấp gọn với quân cờ nam châm.', 1, 0),

    -- Văn phòng phẩm - chia cho cả 3 shop
    ('40000000-0000-4000-8000-000000000031', @shop_01_id, 'Sổ tay bìa da A5', 'Sổ tay A5 bìa da, 200 trang giấy kẻ ngang.', 1, 0),
    ('40000000-0000-4000-8000-000000000032', @shop_02_id, 'Bộ bút gel 10 màu', 'Bộ 10 bút gel màu mực tươi, viết êm.', 1, 0),
    ('40000000-0000-4000-8000-000000000033', @shop_03_id, 'Hộp bút đa năng', 'Hộp bút nhiều ngăn, chất liệu vải chống thấm.', 1, 0),
    ('40000000-0000-4000-8000-000000000034', @shop_03_id, 'Giấy note pastel', 'Bộ giấy ghi chú pastel nhiều kích thước.', 1, 0)
ON DUPLICATE KEY UPDATE
    `shop_id` = VALUES(`shop_id`),
    `name` = VALUES(`name`),
    `description` = VALUES(`description`),
    `is_active` = 1,
    `is_deleted` = 0;

-- Product-category mappings
INSERT INTO `product_categories` (`product_id`, `category_id`, `is_deleted`)
VALUES
    ('40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001', 0),
    ('40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000001', 0),
    ('40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000001', 0),
    ('40000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000001', 0),
    ('40000000-0000-4000-8000-000000000011', '30000000-0000-4000-8000-000000000002', 0),
    ('40000000-0000-4000-8000-000000000012', '30000000-0000-4000-8000-000000000002', 0),
    ('40000000-0000-4000-8000-000000000013', '30000000-0000-4000-8000-000000000002', 0),
    ('40000000-0000-4000-8000-000000000014', '30000000-0000-4000-8000-000000000002', 0),
    ('40000000-0000-4000-8000-000000000021', '30000000-0000-4000-8000-000000000003', 0),
    ('40000000-0000-4000-8000-000000000022', '30000000-0000-4000-8000-000000000003', 0),
    ('40000000-0000-4000-8000-000000000023', '30000000-0000-4000-8000-000000000003', 0),
    ('40000000-0000-4000-8000-000000000024', '30000000-0000-4000-8000-000000000003', 0),
    ('40000000-0000-4000-8000-000000000031', '30000000-0000-4000-8000-000000000004', 0),
    ('40000000-0000-4000-8000-000000000032', '30000000-0000-4000-8000-000000000004', 0),
    ('40000000-0000-4000-8000-000000000033', '30000000-0000-4000-8000-000000000004', 0),
    ('40000000-0000-4000-8000-000000000034', '30000000-0000-4000-8000-000000000004', 0)
ON DUPLICATE KEY UPDATE
    `is_deleted` = 0;

-- One immediately purchasable variant for each product
INSERT INTO `product_variants`
    (`id`, `product_id`, `size`, `color`, `amount`, `price`, `is_active`, `is_deleted`)
VALUES
    ('50000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001', 'M', 'Đen', 100, 149000.00, 1, 0),
    ('50000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002', 'L', 'Xám', 60, 399000.00, 1, 0),
    ('50000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000003', 'M', 'Xanh denim', 45, 459000.00, 1, 0),
    ('50000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000004', 'L', 'Trắng', 50, 349000.00, 1, 0),
    ('50000000-0000-4000-8000-000000000011', '40000000-0000-4000-8000-000000000011', NULL, 'Đen', 80, 499000.00, 1, 0),
    ('50000000-0000-4000-8000-000000000012', '40000000-0000-4000-8000-000000000012', NULL, 'Đen', 40, 890000.00, 1, 0),
    ('50000000-0000-4000-8000-000000000013', '40000000-0000-4000-8000-000000000013', NULL, 'Đen đỏ', 35, 750000.00, 1, 0),
    ('50000000-0000-4000-8000-000000000014', '40000000-0000-4000-8000-000000000014', NULL, 'Đen', 120, 199000.00, 1, 0),
    ('50000000-0000-4000-8000-000000000021', '40000000-0000-4000-8000-000000000021', NULL, 'Nhiều màu', 55, 549000.00, 1, 0),
    ('50000000-0000-4000-8000-000000000022', '40000000-0000-4000-8000-000000000022', NULL, 'Đỏ', 30, 699000.00, 1, 0),
    ('50000000-0000-4000-8000-000000000023', '40000000-0000-4000-8000-000000000023', NULL, 'Trắng', 70, 259000.00, 1, 0),
    ('50000000-0000-4000-8000-000000000024', '40000000-0000-4000-8000-000000000024', NULL, 'Nâu', 65, 189000.00, 1, 0),
    ('50000000-0000-4000-8000-000000000031', '40000000-0000-4000-8000-000000000031', NULL, 'Nâu', 90, 129000.00, 1, 0),
    ('50000000-0000-4000-8000-000000000032', '40000000-0000-4000-8000-000000000032', NULL, 'Nhiều màu', 150, 99000.00, 1, 0),
    ('50000000-0000-4000-8000-000000000033', '40000000-0000-4000-8000-000000000033', NULL, 'Xanh navy', 75, 79000.00, 1, 0),
    ('50000000-0000-4000-8000-000000000034', '40000000-0000-4000-8000-000000000034', NULL, 'Pastel', 200, 49000.00, 1, 0)
ON DUPLICATE KEY UPDATE
    `size` = VALUES(`size`),
    `color` = VALUES(`color`),
    `amount` = VALUES(`amount`),
    `price` = VALUES(`price`),
    `is_active` = 1,
    `is_deleted` = 0;

COMMIT;
