-- ============================================================
-- 企业内部移动办公助手 - MySQL 8.0 完整建表脚本
-- 引擎: InnoDB | 字符集: utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS office_assistant
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE office_assistant;

-- ============================================================
-- 1. 管理员表 (admin)
-- ============================================================
DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin` (
  `id`          INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY COMMENT '管理员ID',
  `username`    VARCHAR(50)    NOT NULL COMMENT '用户名',
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'bcrypt密码哈希',
  `role`        VARCHAR(20)    NOT NULL DEFAULT 'admin' COMMENT '角色',
  `created_at`  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员认证表';

-- ============================================================
-- 2. 员工表 (employees)
-- ============================================================
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id`         INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY COMMENT '员工ID',
  `name`       VARCHAR(20)   NOT NULL COMMENT '姓名（1-20字符）',
  `age`        TINYINT UNSIGNED NOT NULL COMMENT '年龄（18-60）',
  `email`      VARCHAR(100)  NOT NULL COMMENT '邮箱',
  `created_at` TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_created_at` (`created_at` DESC),
  INDEX `idx_email` (`email`),
  CONSTRAINT `chk_age` CHECK (`age` BETWEEN 18 AND 60)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工信息表';

-- ============================================================
-- 3. 设备分类表 (categories)
-- ============================================================
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id`           INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
  `name`         VARCHAR(20)   NOT NULL COMMENT '分类名称（1-20字符）',
  `device_count` INT UNSIGNED  NOT NULL DEFAULT 0 COMMENT '该分类下设备数量（冗余字段）',
  `created_at`   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备分类表';

-- ============================================================
-- 4. 设备表 (devices)
-- ============================================================
DROP TABLE IF EXISTS `devices`;
CREATE TABLE `devices` (
  `id`          INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY COMMENT '设备ID',
  `name`        VARCHAR(100)  NOT NULL COMMENT '设备名称',
  `model`       VARCHAR(100)  DEFAULT NULL COMMENT '设备型号',
  `category_id` INT UNSIGNED  NOT NULL COMMENT '所属分类ID',
  `created_at`  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_created_at` (`created_at` DESC),
  CONSTRAINT `fk_devices_category`
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备信息表';

-- ============================================================
-- 触发器：自动维护 categories.device_count
-- ============================================================
DELIMITER //

CREATE TRIGGER `trg_devices_insert`
AFTER INSERT ON `devices` FOR EACH ROW
BEGIN
  UPDATE `categories` SET `device_count` = `device_count` + 1 WHERE `id` = NEW.`category_id`;
END//

CREATE TRIGGER `trg_devices_delete`
AFTER DELETE ON `devices` FOR EACH ROW
BEGIN
  UPDATE `categories` SET `device_count` = `device_count` - 1 WHERE `id` = OLD.`category_id`;
END//

CREATE TRIGGER `trg_devices_update`
AFTER UPDATE ON `devices` FOR EACH ROW
BEGIN
  IF OLD.`category_id` != NEW.`category_id` THEN
    UPDATE `categories` SET `device_count` = `device_count` - 1 WHERE `id` = OLD.`category_id`;
    UPDATE `categories` SET `device_count` = `device_count` + 1 WHERE `id` = NEW.`category_id`;
  END IF;
END//

DELIMITER ;

-- ============================================================
-- 初始数据
-- ============================================================

-- 管理员: admin / admin123
-- bcrypt hash for 'admin123' (12 rounds)
INSERT INTO `admin` (`username`, `password_hash`, `role`) VALUES
('admin', '$2b$12$ywcOjie5v1u7inQn1BthfupHH9NpopYOM8KVsEF3qypUPTvayikua', 'admin');

-- 示例员工
INSERT INTO `employees` (`name`, `age`, `email`, `created_at`) VALUES
('张三', 28, 'zhangsan@company.com', '2024-01-15 10:00:00'),
('李四', 32, 'lisi@company.com',     '2024-02-20 11:30:00'),
('王五', 25, 'wangwu@company.com',   '2024-03-10 14:20:00');

-- 示例分类
INSERT INTO `categories` (`name`, `created_at`) VALUES
('办公设备', '2024-01-01 09:00:00'),
('网络设备', '2024-01-05 10:00:00'),
('安防设备', '2024-01-10 11:00:00');

-- 示例设备（触发器会自动更新 device_count）
INSERT INTO `devices` (`name`, `model`, `category_id`, `created_at`) VALUES
('MacBook Pro',    'M3 Max',                       1, '2024-01-16 09:00:00'),
('Dell显示器',     'U2723DE',                      1, '2024-01-17 10:00:00'),
('ThinkPad',       'X1 Carbon',                    1, '2024-01-18 11:00:00'),
('iPhone 15 Pro',  '256GB',                        1, '2024-01-19 12:00:00'),
('无线键盘',       'MX Keys',                      1, '2024-01-20 13:00:00'),
('Cisco交换机',    'Catalyst 2960',                2, '2024-01-21 14:00:00'),
('路由器',         'Cisco RV340',                  2, '2024-01-22 15:00:00'),
('防火墙',         'FortiGate 60F',                2, '2024-01-23 16:00:00'),
('监控摄像头',     'Hikvision DS-2CD2143G2-I',     3, '2024-01-24 17:00:00'),
('门禁系统',       'ZKTeco K40',                   3, '2024-01-25 18:00:00');
