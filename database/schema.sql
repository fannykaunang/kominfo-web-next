-- Database Schema untuk Portal Berita Kabupaten Merauke
-- MySQL 8.0+

-- =====================================================
-- TABLE: users
-- =====================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN', 'EDITOR', 'AUTHOR') DEFAULT 'EDITOR',
  `avatar` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: kategori
-- =====================================================
CREATE TABLE IF NOT EXISTS `kategori` (
  `id` VARCHAR(36) PRIMARY KEY,
  `nama` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) UNIQUE NOT NULL,
  `deskripsi` TEXT NULL,
  `icon` VARCHAR(100) NULL,
  `color` VARCHAR(20) DEFAULT '#3b82f6',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: berita
-- =====================================================
CREATE TABLE IF NOT EXISTS `berita` (
  `id` VARCHAR(36) PRIMARY KEY,
  `judul` VARCHAR(500) NOT NULL,
  `slug` VARCHAR(500) UNIQUE NOT NULL,
  `excerpt` TEXT NOT NULL,
  `konten` LONGTEXT NOT NULL,
  `featured_image` VARCHAR(500) NULL,
  `galeri` TEXT NULL COMMENT 'JSON array of images',
  `views` INT DEFAULT 0,
  `is_highlight` BOOLEAN DEFAULT FALSE,
  `is_published` BOOLEAN DEFAULT FALSE,
  `published_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `kategori_id` VARCHAR(36) NOT NULL,
  `author_id` VARCHAR(36) NOT NULL,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_kategori_id` (`kategori_id`),
  INDEX `idx_author_id` (`author_id`),
  INDEX `idx_published_at` (`published_at`),
  INDEX `idx_is_published` (`is_published`),
  INDEX `idx_is_highlight` (`is_highlight`),
  FULLTEXT INDEX `idx_fulltext_search` (`judul`, `excerpt`, `konten`),
  FOREIGN KEY (`kategori_id`) REFERENCES `kategori`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: tags
-- =====================================================
CREATE TABLE IF NOT EXISTS `tags` (
  `id` VARCHAR(36) PRIMARY KEY,
  `nama` VARCHAR(255) UNIQUE NOT NULL,
  `slug` VARCHAR(255) UNIQUE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: berita_tags (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS `berita_tags` (
  `berita_id` VARCHAR(36) NOT NULL,
  `tag_id` VARCHAR(36) NOT NULL,
  PRIMARY KEY (`berita_id`, `tag_id`),
  FOREIGN KEY (`berita_id`) REFERENCES `berita`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: komentar
-- =====================================================
CREATE TABLE IF NOT EXISTS `komentar` (
  `id` VARCHAR(36) PRIMARY KEY,
  `nama` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `konten` TEXT NOT NULL,
  `is_approved` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `berita_id` VARCHAR(36) NOT NULL,
  INDEX `idx_berita_id` (`berita_id`),
  INDEX `idx_is_approved` (`is_approved`),
  FOREIGN KEY (`berita_id`) REFERENCES `berita`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: statistik
-- =====================================================
CREATE TABLE IF NOT EXISTS `statistik` (
  `id` VARCHAR(36) PRIMARY KEY,
  `judul` VARCHAR(255) NOT NULL,
  `nilai` VARCHAR(100) NOT NULL,
  `satuan` VARCHAR(50) NULL,
  `icon` VARCHAR(100) NULL,
  `kategori` VARCHAR(100) NOT NULL,
  `urutan` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_urutan` (`urutan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: banner
-- =====================================================
CREATE TABLE IF NOT EXISTS `banner` (
  `id` VARCHAR(36) PRIMARY KEY,
  `judul` VARCHAR(255) NOT NULL,
  `deskripsi` TEXT NULL,
  `image` VARCHAR(500) NOT NULL,
  `link` VARCHAR(500) NULL,
  `urutan` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_urutan` (`urutan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: galeri
-- =====================================================
CREATE TABLE IF NOT EXISTS `galeri` (
  `id` VARCHAR(36) PRIMARY KEY,
  `judul` VARCHAR(255) NOT NULL,
  `deskripsi` TEXT NULL,
  `image` VARCHAR(500) NOT NULL,
  `kategori` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_kategori` (`kategori`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: settings
-- =====================================================
CREATE TABLE IF NOT EXISTS `settings` (
  `id` VARCHAR(36) PRIMARY KEY,
  `key` VARCHAR(255) UNIQUE NOT NULL,
  `value` TEXT NOT NULL,
  `type` VARCHAR(50) DEFAULT 'text' COMMENT 'text, json, boolean, number',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: newsletter
-- =====================================================
CREATE TABLE IF NOT EXISTS `newsletter` (
  `id` VARCHAR(36) PRIMARY KEY,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `subscribed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `unsubscribed_at` TIMESTAMP NULL,
  INDEX `idx_email` (`email`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
