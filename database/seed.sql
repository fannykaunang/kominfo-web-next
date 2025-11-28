-- Seed Data untuk Portal Berita Kabupaten Merauke

-- =====================================================
-- SEED: Kategori
-- =====================================================
INSERT INTO `kategori` (`id`, `nama`, `slug`, `deskripsi`, `icon`, `color`) VALUES
(UUID(), 'Pemerintahan', 'pemerintahan', 'Berita seputar kebijakan dan program pemerintah daerah', 'building', '#3b82f6'),
(UUID(), 'Pembangunan', 'pembangunan', 'Informasi pembangunan infrastruktur dan proyek daerah', 'hammer', '#f59e0b'),
(UUID(), 'Pendidikan', 'pendidikan', 'Berita dan program pendidikan di Kabupaten Merauke', 'graduation', '#8b5cf6'),
(UUID(), 'Kesehatan', 'kesehatan', 'Informasi layanan dan program kesehatan masyarakat', 'heart', '#14b8a6'),
(UUID(), 'UMKM', 'umkm', 'Perkembangan UMKM dan ekonomi kreatif lokal', 'store', '#10b981'),
(UUID(), 'Pariwisata', 'pariwisata', 'Destinasi wisata dan event pariwisata Merauke', 'palmtree', '#06b6d4'),
(UUID(), 'Budaya', 'budaya', 'Kesenian dan budaya khas Papua Selatan', 'music', '#ec4899'),
(UUID(), 'Sosial', 'sosial', 'Kegiatan sosial kemasyarakatan', 'heart', '#ef4444');

-- =====================================================
-- SEED: Statistik
-- =====================================================
INSERT INTO `statistik` (`id`, `judul`, `nilai`, `satuan`, `icon`, `kategori`, `urutan`) VALUES
(UUID(), 'Jumlah Penduduk', '234,617', 'jiwa', 'users', 'demografi', 1),
(UUID(), 'Luas Wilayah', '46,791', 'km²', 'building', 'geografis', 2),
(UUID(), 'UMKM Aktif', '3,456', 'unit', 'briefcase', 'ekonomi', 3),
(UUID(), 'Pertumbuhan Ekonomi', '5.2', '%', 'trending', 'ekonomi', 4);

-- =====================================================
-- SEED: Tags
-- =====================================================
INSERT INTO `tags` (`id`, `nama`, `slug`) VALUES
(UUID(), 'Trans Papua', 'trans-papua'),
(UUID(), 'Infrastruktur', 'infrastruktur'),
(UUID(), 'Pembangunan Daerah', 'pembangunan-daerah'),
(UUID(), 'Pendidikan', 'pendidikan'),
(UUID(), 'Kesehatan', 'kesehatan'),
(UUID(), 'UMKM', 'umkm'),
(UUID(), 'Pariwisata', 'pariwisata'),
(UUID(), 'Budaya Lokal', 'budaya-lokal'),
(UUID(), 'Program Pemerintah', 'program-pemerintah'),
(UUID(), 'Bantuan Sosial', 'bantuan-sosial');

-- =====================================================
-- SEED: Settings
-- =====================================================
INSERT INTO `settings` (`id`, `key`, `value`, `type`) VALUES
(UUID(), 'site_name', 'Portal Berita Kabupaten Merauke', 'text'),
(UUID(), 'site_description', 'Portal berita resmi Pemerintah Kabupaten Merauke', 'text'),
(UUID(), 'site_logo', '/images/logo.png', 'text'),
(UUID(), 'contact_email', 'info@meraukekab.go.id', 'text'),
(UUID(), 'contact_phone', '(0971) 321234', 'text'),
(UUID(), 'contact_address', 'Jl. Raya Mandala No. 1, Merauke, Papua Selatan 99611', 'text'),
(UUID(), 'social_facebook', 'https://facebook.com/meraukekab', 'text'),
(UUID(), 'social_instagram', 'https://instagram.com/meraukekab', 'text'),
(UUID(), 'social_twitter', 'https://twitter.com/meraukekab', 'text'),
(UUID(), 'social_youtube', 'https://youtube.com/@meraukekab', 'text');

-- =====================================================
-- SEED: Admin User (Default)
-- Password: admin123 (harus di-hash dengan bcrypt di aplikasi)
-- =====================================================
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
(UUID(), 'Admin Portal', 'admin@meraukekab.go.id', '$2a$10$EXAMPLE_HASH_REPLACE_THIS', 'ADMIN');

-- Note: Untuk production, gunakan password yang di-hash dengan bcrypt
-- Contoh di Node.js: const bcrypt = require('bcrypt'); const hash = await bcrypt.hash('password', 10);
