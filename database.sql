-- Asil Kafe sipariş tabloları
-- MySQL'de veritabanı oluşturduktan sonra bu dosyayı çalıştırın.
-- Örnek: mysql -u root -p < database.sql

CREATE DATABASE IF NOT EXISTS asil_kafe;
USE asil_kafe;

-- Sipariş başlığı (her sipariş için 1 satır)
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  totalAmount DECIMAL(10,2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sipariş kalemleri (her ürün için 1 satır)
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  itemName VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  totalPrice DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
);

-- Bağlantı için .env dosyasında DB_USER, DB_PASSWORD, DB_NAME ayarlayın
-- veya server.js varsayılanları kullanır (root, boş şifre, asil_kafe).
