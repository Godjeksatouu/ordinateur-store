-- Create database
CREATE DATABASE IF NOT EXISTS store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE store;

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('product_manager', 'gestion_commandes', 'super_admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255) NOT NULL,
    ram VARCHAR(50),
    storage VARCHAR(50),
    screen VARCHAR(100),
    graphics VARCHAR(100),
    os VARCHAR(50),
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2) NOT NULL,
    images JSON,
    description TEXT,
    description_ar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    status ENUM('en_attente', 'confirme', 'declined', 'en_cours', 'livre', 'retour') DEFAULT 'en_attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password, role) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin');

-- Insert sample users for different roles
INSERT INTO users (username, password, role) VALUES 
('product_manager', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'product_manager'),
('order_manager', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'gestion_commandes');

-- Insert sample products
INSERT INTO products (name, name_ar, ram, storage, screen, graphics, os, old_price, new_price, description, description_ar) VALUES 
('HP EliteBook 840 G7', 'اتش بي إليت بوك 840 جي 7', '16GB DDR4', '512GB SSD', '14" FHD', 'Intel UHD Graphics', 'Windows 11 Pro', 85000.00, 75000.00, 'Professional laptop with excellent performance', 'حاسوب محمول احترافي بأداء ممتاز'),
('HP EliteBook 850 G8', 'اتش بي إليت بوك 850 جي 8', '32GB DDR4', '1TB SSD', '15.6" FHD', 'NVIDIA GeForce MX450', 'Windows 11 Pro', 120000.00, 95000.00, 'High-performance laptop for demanding tasks', 'حاسوب محمول عالي الأداء للمهام الصعبة'),
('HP ZBook Studio G8', 'اتش بي زي بوك ستوديو جي 8', '64GB DDR4', '2TB SSD', '15.6" 4K', 'NVIDIA RTX A2000', 'Windows 11 Pro', 180000.00, 150000.00, 'Workstation laptop for creative professionals', 'حاسوب محمول للمحترفين المبدعين');

-- Insert sample clients
INSERT INTO clients (full_name, phone, city, address) VALUES 
('أحمد محمد', '0661234567', 'الدار البيضاء', 'حي المعاريف، شارع الحسن الثاني'),
('فاطمة الزهراء', '0662345678', 'الرباط', 'أكدال، شارع محمد الخامس'),
('يوسف العلوي', '0663456789', 'فاس', 'المدينة القديمة، باب بوجلود');

-- Insert sample orders
INSERT INTO orders (client_id, product_id, product_name, status) VALUES 
(1, 1, 'اتش بي إليت بوك 840 جي 7', 'en_attente'),
(2, 2, 'اتش بي إليت بوك 850 جي 8', 'confirme'),
(3, 3, 'اتش بي زي بوك ستوديو جي 8', 'en_cours'),
(1, 2, 'اتش بي إليت بوك 850 جي 8', 'livre');
