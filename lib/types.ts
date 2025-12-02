/**
 * Database Types
 * Centralized type definitions untuk semua database models
 */

import { RowDataPacket } from "mysql2/promise";

/**
 * User Model
 */
export interface User extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "EDITOR" | "AUTHOR";
  avatar: string | null;
  is_active: number;
  email_verified: number;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * OTP Code Model
 */
export interface OTPCode extends RowDataPacket {
  id: number;
  email: string;
  code: string;
  type: "login" | "register" | "reset_password";
  expires_at: Date;
  is_used: number;
  created_at: Date;
}

/**
 * Login Attempt Model
 */
export interface LoginAttempt extends RowDataPacket {
  id: number;
  email: string | null;
  ip_address: string;
  user_agent: string | null;
  success: number;
  failure_reason: string | null;
  created_at: Date;
}

/**
 * Kategori Model
 * (sudah termasuk `berita_count?` untuk hasil JOIN)
 */
export interface Kategori extends RowDataPacket {
  id: string;
  nama: string;
  slug: string;
  deskripsi: string | null;
  icon: string | null;
  color: string | null;
  created_at: Date;
  updated_at: Date;
  berita_count?: number; // From JOIN query
}

/**
 * Menu Model
 */
export interface Menu extends RowDataPacket {
  id: string;
  nama: string;
  slug: string;
  icon: string | null;
  urutan: number;
  is_published: number;
  deskripsi: string | null;
  created_at: Date;
  updated_at: Date;
  halaman_count?: number; // From JOIN query
}

/**
 * Halaman Model
 */
export interface Halaman extends RowDataPacket {
  id: string;
  menu_id: string;
  judul: string;
  slug: string;
  konten: string;
  excerpt: string | null;
  urutan: number;
  is_published: number;
  views: number;
  meta_title: string | null;
  meta_description: string | null;
  author_id: string | null;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  menu_nama?: string;
  menu_slug?: string;
  author_name?: string | null;
}

/**
 * Berita Model (row dari database)
 */
export interface Berita extends RowDataPacket {
  id: string;
  judul: string;
  slug: string;
  excerpt: string;
  konten: string;
  featured_image: string | null;
  galeri: string | null; // JSON string di DB
  views: number;
  is_highlight: number; // tinyint(1) di DB
  is_published: number; // tinyint(1) di DB
  published_at: Date | null;
  kategori_id: string;
  author_id: string;
  created_at: Date;
  updated_at: Date;

  // Joined fields (opsional, dari JOIN dengan kategori & users)
  kategori_nama?: string;
  kategori_slug?: string;
  kategori_color?: string;
  author_name?: string;
}

/**
 * Tag Model
 */
export interface Tag extends RowDataPacket {
  id: string;
  nama: string;
  slug: string;
  created_at: Date;
}

/**
 * Berita Tag Junction
 */
export interface BeritaTag extends RowDataPacket {
  berita_id: string;
  tag_id: string;
}

/**
 * Komentar Model
 */
export interface Komentar extends RowDataPacket {
  id: string;
  nama: string;
  email: string;
  konten: string;
  is_approved: number;
  berita_id: string;
  created_at: Date;
}

/**
 * Statistik Model
 */
export interface Statistik extends RowDataPacket {
  id: string;
  judul: string;
  nilai: string;
  satuan: string | null;
  icon: string | null;
  kategori: string | null;
  urutan: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Banner Model
 */
export interface Banner extends RowDataPacket {
  id: string;
  judul: string;
  deskripsi: string | null;
  image: string;
  link: string | null;
  urutan: number;
  is_active: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Galeri Model
 */
export interface Galeri extends RowDataPacket {
  id: string;
  judul: string;
  deskripsi: string | null;
  image: string;
  kategori: string | null;
  created_at: Date;
}

/**
 * Slider Model
 */
export interface Slider extends RowDataPacket {
  id: string;
  judul: string;
  deskripsi: string | null;
  image: string;
  is_published: number;
  created_at: Date;
}

/**
 * Settings Model
 */
export interface Settings extends RowDataPacket {
  id: string;
  key: string;
  value: string;
  type: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Newsletter Model
 */
export interface Newsletter extends RowDataPacket {
  id: string;
  email: string;
  is_active: number;
  subscribed_at: Date;
  unsubscribed_at: Date | null;
}

/**
 * Safe User Type (without password)
 */
export type SafeUser = Omit<User, "password">;

/**
 * User Create Input
 */
export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "EDITOR" | "AUTHOR";
  avatar?: string | null;
}

/**
 * User Update Input
 */
export interface UserUpdateInput {
  name?: string;
  email?: string;
  password?: string;
  role?: "ADMIN" | "EDITOR" | "AUTHOR";
  avatar?: string | null;
  is_active?: number;
}

/**
 * Menu Create Input
 */
export interface MenuCreateInput {
  nama: string;
  slug: string;
  icon?: string | null;
  urutan?: number;
  is_published?: number;
  deskripsi?: string | null;
}

/**
 * Menu Update Input
 */
export interface MenuUpdateInput {
  nama?: string;
  slug?: string;
  icon?: string | null;
  urutan?: number;
  is_published?: number;
  deskripsi?: string | null;
}

/**
 * Halaman Create Input
 */
export interface HalamanCreateInput {
  menu_id: string;
  judul: string;
  slug: string;
  konten: string;
  excerpt?: string | null;
  urutan?: number;
  is_published?: number;
  meta_title?: string | null;
  meta_description?: string | null;
  author_id?: string | null;
}

/**
 * Halaman Update Input
 */
export interface HalamanUpdateInput {
  menu_id?: string;
  judul?: string;
  slug?: string;
  konten?: string;
  excerpt?: string | null;
  urutan?: number;
  is_published?: number;
  meta_title?: string | null;
  meta_description?: string | null;
  author_id?: string | null;
}

/**
 * Berita Create Input (app-level, bukan RowDataPacket)
 * Dipakai di service / repository untuk input dari form
 */
export interface BeritaCreateInput {
  judul: string;
  slug: string;
  excerpt: string;
  konten: string;
  featured_image?: string | null;
  galeri?: string[]; // array di app, disimpan ke DB sebagai JSON string
  is_highlight?: boolean; // app-level boolean
  is_published?: boolean; // app-level boolean
  published_at?: Date | null;
  kategori_id: string;
  author_id: string;
}

/**
 * Berita Update Input
 */
export interface BeritaUpdateInput extends Partial<BeritaCreateInput> {}

/**
 * Pagination Result
 */
export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Log Aktivitas
 */
export interface LogAktivitas extends RowDataPacket {
  log_id: number;
  pegawai_id: number | null;
  aksi: string;
  modul: string;
  detail_aksi?: string;
  data_sebelum?: any; // JSON
  data_sesudah?: any; // JSON
  ip_address?: string;
  user_agent?: string;
  endpoint?: string;
  method?: string;
  created_at?: Date;
}

export interface CreateLogInput {
  user_id: string | null;
  aksi: string;
  modul: string;
  detail_aksi?: string | null;
  data_sebelum?: any | null;
  data_sesudah?: any | null;
  ip_address?: string | null;
  user_agent?: string | null;
  endpoint?: string | null;
  method?: string | null;
}

export interface CreateLogWithDataInput extends CreateLogInput {
  data_sebelum: any;
  data_sesudah: any;
}

// Galeri Model
export interface Galeri extends RowDataPacket {
  id: string;
  judul: string;
  deskripsi: string | null;
  media_type: "image" | "video";
  media_url: string; // JSON string for images: '["url1","url2"]' OR YouTube URL for video
  thumbnail: string | null;
  kategori: string | null;
  is_published: number;
  urutan: number;
  views: number;
  created_at: Date;
  updated_at: Date;
}

// Helper type for parsed images
export interface GaleriWithParsedImages extends Omit<Galeri, "media_url"> {
  media_url: string | string[]; // string[] for images, string for video
}

// Input Types
export interface GaleriCreateInput {
  judul: string;
  deskripsi?: string;
  media_type: "image" | "video";
  media_url: string | string[]; // Array of URLs for images OR single YouTube URL for video
  thumbnail?: string;
  kategori: string;
  is_published?: number;
  urutan?: number;
}

export interface GaleriUpdateInput {
  judul?: string;
  deskripsi?: string;
  media_type?: "image" | "video";
  media_url?: string | string[]; // Array of URLs for images OR single YouTube URL for video
  thumbnail?: string;
  kategori?: string;
  is_published?: number;
  urutan?: number;
}

// Filter Options
export interface GaleriFilterOptions {
  search?: string;
  kategori?: string;
  media_type?: "image" | "video";
  is_published?: string;
}
