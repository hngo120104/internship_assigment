SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE
    users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hashed VARCHAR(255) NOT NULL,
        role ENUM ('CUSTOMER', 'SHOP') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE


CREATE TABLE
    products (
        id VARCHAR(36) PRIMARY KEY,
        shop_id VARCHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INT NOT NULL,
        status ENUM ('available', 'unavailable') NOT NULL DEFAULT 'available',
        FOREIGN KEY (orders_id) REFERENCES orders (products_id),
        FOREIGN KEY (shop_id) REFERENCES users (id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE
    carts (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id),
    );

CREATE TABLE
    cart_items (
        id VARCHAR(36) PRIMARY KEY,
        cart_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36) NOT NULL,
        quantity INT NOT NULL,
        FOREIGN KEY (cart_id) REFERENCES carts (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
    );

CREATE TABLE
    orders (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        status ENUM ('pending', 'completed', 'cancelled') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );

CREATE TABLE
    order_items (
        id VARCHAR(36) PRIMARY KEY,
        order_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36) NOT NULL,
        quantity INT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
    );

SET FOREIGN_KEY_CHECKS = 1;