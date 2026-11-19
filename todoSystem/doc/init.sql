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

-- 英语四级学习计划：单元 / 月
CREATE TABLE `study_units` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `en` varchar(100) NOT NULL,
  `theme` text NOT NULL,
  `intro` text NOT NULL,
  `introZh` text NOT NULL,
  `outro` text NOT NULL,
  `outroZh` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 英语四级学习计划：学习日（200 天）
CREATE TABLE `study_days` (
  `id` int NOT NULL AUTO_INCREMENT,
  `unitId` int NOT NULL,
  `dayNo` int NOT NULL,
  `globalDay` int NOT NULL,
  `theme` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_study_days_globalDay` (`globalDay`),
  KEY `IDX_study_days_unitId` (`unitId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 英语四级学习计划：单词（4000 条）
CREATE TABLE `study_words` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dayId` int NOT NULL,
  `seq` int NOT NULL,
  `word` varchar(100) NOT NULL,
  `pos` varchar(20) NOT NULL,
  `meaning` varchar(255) NOT NULL,
  `exampleEn` text NOT NULL,
  `exampleZh` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_study_words_dayId` (`dayId`),
  KEY `IDX_study_words_word` (`word`),
  KEY `IDX_study_words_meaning` (`meaning`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 英语四级学习计划：影视推荐
CREATE TABLE `study_films` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `cn` varchar(100) NOT NULL,
  `year` varchar(10) NOT NULL,
  `genre` varchar(100) NOT NULL,
  `level` varchar(100) NOT NULL,
  `reason` text NOT NULL,
  `synopsis` text NOT NULL,
  `tips` text NOT NULL,
  `quote` text NOT NULL,
  `quoteZh` text NOT NULL,
  `sortOrder` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 英语四级学习计划：用户学习进度（按用户隔离）
CREATE TABLE `study_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `globalDay` int NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_study_progress_user_day` (`userId`, `globalDay`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
