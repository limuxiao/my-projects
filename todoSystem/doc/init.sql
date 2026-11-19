-- TodoSystem 初始化建表语句
-- 依据 backend/src/todos/entities/todo.entity.ts 与 backend/src/users/entities/user.entity.ts 生成

CREATE TABLE `todos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `completed` tinyint(1) NOT NULL DEFAULT 0,
  `userId` int NOT NULL,
  KEY `IDX_todos_userId` (`userId`),
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phone` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nickname` varchar(64) DEFAULT NULL,
  `gender` enum('unknown', 'male', 'female') NOT NULL DEFAULT 'unknown',
  `age` int DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `vip_level` tinyint NOT NULL DEFAULT 0,
  `real_name_info` json DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `role` enum('user', 'admin') NOT NULL DEFAULT 'user',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_a000cca60bcf04454e727699490` (`phone`),
  UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be3` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
