/**
 * Database Types
 * Centralized type definitions untuk semua database models
 */

import { RowDataPacket } from "mysql2/promise"

/**
 * User Model
 */
export interface User extends RowDataPacket {
  id: string
  name: string
  email: string
  password: string
  role: "ADMIN" | "EDITOR" | "AUTHOR"
  avatar: string | null
  is_active: number
  email_verified: number
  last_login_at: Date | null
  created_at: Date
  updated_at: Date
}

/**
 * OTP Code Model
 */
export interface OTPCode extends RowDataPacket {
  id: number
  email: string
  code: string
  type: "login" | "register" | "reset_password"
  expires_at: Date
  is_used: number
  created_at: Date
}

/**
 * Login Attempt Model
 */
export interface LoginAttempt extends RowDataPacket {
  id: number
  email: string | null
  ip_address: string
  user_agent: string | null
  success: number
  failure_reason: string | null
  created_at: Date
}

/**
 * Kategori Model
 */
export interface Kategori extends RowDataPacket {
  id: string
  nama: string
  slug: string
  deskripsi: string | null
  icon: string | null
  color: string | null
  created_at: Date
  updated_at: Date
}

/**
 * Berita Model
 */
export interface Berita extends RowDataPacket {
  id: string
  judul: string
  slug: string
  excerpt: string
  konten: string
  featured_image: string | null
  galeri: string | null // JSON string
  views: number
  is_highlight: number
  is_published: number
  published_at: Date | null
  kategori_id: string
  author_id: string
  created_at: Date
  updated_at: Date
}

/**
 * Tag Model
 */
export interface Tag extends RowDataPacket {
  id: string
  nama: string
  slug: string
  created_at: Date
}

/**
 * Berita Tag Junction
 */
export interface BeritaTag extends RowDataPacket {
  berita_id: string
  tag_id: string
}

/**
 * Komentar Model
 */
export interface Komentar extends RowDataPacket {
  id: string
  nama: string
  email: string
  konten: string
  is_approved: number
  berita_id: string
  created_at: Date
}

/**
 * Statistik Model
 */
export interface Statistik extends RowDataPacket {
  id: string
  judul: string
  nilai: string
  satuan: string | null
  icon: string | null
  kategori: string | null
  urutan: number
  created_at: Date
  updated_at: Date
}

/**
 * Banner Model
 */
export interface Banner extends RowDataPacket {
  id: string
  judul: string
  deskripsi: string | null
  image: string
  link: string | null
  urutan: number
  is_active: number
  created_at: Date
  updated_at: Date
}

/**
 * Galeri Model
 */
export interface Galeri extends RowDataPacket {
  id: string
  judul: string
  deskripsi: string | null
  image: string
  kategori: string | null
  created_at: Date
}

/**
 * Settings Model
 */
export interface Settings extends RowDataPacket {
  id: string
  key: string
  value: string
  type: string | null
  created_at: Date
  updated_at: Date
}

/**
 * Newsletter Model
 */
export interface Newsletter extends RowDataPacket {
  id: string
  email: string
  is_active: number
  subscribed_at: Date
  unsubscribed_at: Date | null
}

/**
 * Safe User Type (without password)
 */
export type SafeUser = Omit<User, "password">

/**
 * User Create Input
 */
export interface UserCreateInput {
  name: string
  email: string
  password: string
  role: "ADMIN" | "EDITOR" | "AUTHOR"
  avatar?: string | null
}

/**
 * User Update Input
 */
export interface UserUpdateInput {
  name?: string
  email?: string
  password?: string
  role?: "ADMIN" | "EDITOR" | "AUTHOR"
  avatar?: string | null
  is_active?: number
}

/**
 * Berita Create Input
 */
export interface BeritaCreateInput {
  judul: string
  slug: string
  excerpt: string
  konten: string
  featured_image?: string | null
  galeri?: string | null
  is_highlight?: number
  is_published?: number
  published_at?: Date | null
  kategori_id: string
  author_id: string
}

/**
 * Pagination Result
 */
export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
