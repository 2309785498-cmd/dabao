-- 企业内部移动办公助手 - MySQL 8.0 数据库建表脚本
-- 创建时间: 2024-05-22

-- 创建数据库
CREATE DATABASE IF NOT EXISTS office_assistant DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE office_assistant;

-- ==========================================
-- 员工表 (employees)
-- ==========================================
DROP TABLE IF EXISTS employees;
CREATE TABLE employees (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '员工ID',
  name VARCHAR(20) NOT NULL COMMENT '员工姓名',
  age TINYINT UNSIGNED NOT NULL COMMENT '员工年龄',
  email VARCHAR(100) NOT NULL COMMENT '员工邮箱',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_created_at (created_at DESC) COMMENT '按创建时间倒序索引',
  INDEX idx_email (email) COMMENT '邮箱索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工信息表';

-- 添加员工年龄约束
ALTER TABLE employees ADD CONSTRAINT chk_age CHECK (age BETWEEN 18 AND 60);

-- ==========================================
-- 设备分类表 (categories)
-- ==========================================
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
  name VARCHAR(20) NOT NULL COMMENT '分类名称',
  device_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '设备数量（冗余字段，提高查询性能）',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_name (name) COMMENT '分类名称唯一索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备分类表';

-- ==========================================
-- 设备表 (devices)
-- ==========================================
DROP TABLE IF EXISTS devices;
CREATE TABLE devices (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '设备ID',
  name VARCHAR(100) NOT NULL COMMENT '设备名称',
  model VARCHAR(100) DEFAULT NULL COMMENT '设备型号',
  category_id INT UNSIGNED NOT NULL COMMENT '所属分类ID',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_category_id (category_id) COMMENT '分类ID索引',
  INDEX idx_created_at (created_at DESC) COMMENT '按创建时间倒序索引',
  CONSTRAINT fk_devices_category FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
    COMMENT '外键约束：设备必须属于某个分类，分类被删除时限制删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备信息表';

-- ==========================================
-- 用户表 (users) - 用于 JWT 登录认证
-- ==========================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  username VARCHAR(50) NOT NULL COMMENT '用户名',
  password VARCHAR(255) NOT NULL COMMENT '密码（BCrypt 哈希）',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  last_login_at TIMESTAMP NULL DEFAULT NULL COMMENT '最后登录时间',
  UNIQUE KEY uk_username (username) COMMENT '用户名唯一索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户认证表';

-- ==========================================
-- 初始化数据
-- ==========================================

-- 插入测试员工数据
INSERT INTO employees (name, age, email, created_at) VALUES
('张三', 28, 'zhangsan@company.com', '2024-01-15 10:00:00'),
('李四', 32, 'lisi@company.com', '2024-02-20 11:30:00'),
('王五', 25, 'wangwu@company.com', '2024-03-10 14:20:00');

-- 插入设备分类数据
INSERT INTO categories (name, device_count, created_at) VALUES
('办公设备', 5, '2024-01-01 09:00:00'),
('网络设备', 3, '2024-01-05 10:00:00'),
('安防设备', 2, '2024-01-10 11:00:00');

-- 插入设备数据
INSERT INTO devices (name, model, category_id, created_at) VALUES
('MacBook Pro', 'M3 Max', 1, '2024-01-16 09:00:00'),
('Dell显示器', 'U2723DE', 1, '2024-01-17 10:00:00'),
('ThinkPad', 'X1 Carbon', 1, '2024-01-18 11:00:00'),
('iPhone 15 Pro', '256GB', 1, '2024-01-19 12:00:00'),
('无线键盘', 'MX Keys', 1, '2024-01-20 13:00:00'),
('Cisco交换机', 'Catalyst 2960', 2, '2024-01-21 14:00:00'),
('路由器', 'Cisco RV340', 2, '2024-01-22 15:00:00'),
('防火墙', 'FortiGate 60F', 2, '2024-01-23 16:00:00'),
('监控摄像头', 'Hikvision DS-2CD2143G2-I', 3, '2024-01-24 17:00:00'),
('门禁系统', 'ZKTeco K40', 3, '2024-01-25 18:00:00');

-- 插入管理员用户（密码为 BCrypt 加密后的 '123456'）
-- 注意：实际使用时需要用后端框架生成 BCrypt hash
-- Python 示例: from bcrypt import hashpw, gensalt; hashpw(b'123456', gensalt())
INSERT INTO users (username, password) VALUES
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVr/qvIrK');

-- ==========================================
-- 触发器：自动更新分类的设备数量
-- ==========================================

-- 添加设备时，分类设备数量 +1
DELIMITER //
CREATE TRIGGER trg_devices_insert_update_count
AFTER INSERT ON devices
FOR EACH ROW
BEGIN
  UPDATE categories
  SET device_count = device_count + 1
  WHERE id = NEW.category_id;
END//

-- 删除设备时，分类设备数量 -1
CREATE TRIGGER trg_devices_delete_update_count
AFTER DELETE ON devices
FOR EACH ROW
BEGIN
  UPDATE categories
  SET device_count = device_count - 1
  WHERE id = OLD.category_id;
END//

-- 修改设备分类时，旧分类 -1，新分类 +1
CREATE TRIGGER trg_devices_update_category
AFTER UPDATE ON devices
FOR EACH ROW
BEGIN
  IF OLD.category_id != NEW.category_id THEN
    UPDATE categories
    SET device_count = device_count - 1
    WHERE id = OLD.category_id;

    UPDATE categories
    SET device_count = device_count + 1
    WHERE id = NEW.category_id;
  END IF;
END//

DELIMITER ;

-- ==========================================
-- 查询验证
-- ==========================================

-- 查看所有表
SHOW TABLES;

-- 查看各表数据
SELECT * FROM employees ORDER BY created_at DESC;
SELECT * FROM categories;
SELECT * FROM devices;
SELECT * FROM users;

-- 查询设备及其所属分类信息
SELECT
  d.id,
  d.name AS device_name,
  d.model,
  c.name AS category_name,
  d.created_at
FROM devices d
LEFT JOIN categories c ON d.category_id = c.id
ORDER BY d.created_at DESC;
