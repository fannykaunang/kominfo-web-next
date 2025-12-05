// lib/models/berita.model.ts

import {
  query,
  queryOne,
  execute,
  generateUUID,
  buildPagination,
} from "../db-helpers";
import { Berita, PaginationResult } from "../types";
import { createLogWithData } from "./log.model";

/**
 * Input untuk membuat berita (app-level)
 */
export interface BeritaCreateInput {
  judul: string;
  slug: string;
  excerpt: string;
  konten: string;
  featured_image?: string;
  galeri?: string[];
  kategori_id: string;
  author_id: string;
  is_highlight?: boolean;
  is_published?: boolean;
  published_at?: Date | null;
}

/**
 * Input untuk update berita
 */
export interface BeritaUpdateInput extends Partial<BeritaCreateInput> {}

/**
 * Repository untuk tabel berita dengan logging
 */
export class BeritaRepository {
  /**
   * Get all berita with pagination and filters
   */
  static async findAll(
    options: {
      page?: number;
      limit?: number;
      kategori_id?: string;
      is_published?: boolean;
      is_highlight?: boolean;
      search?: string;
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ): Promise<PaginationResult<Berita>> {
    const {
      page = 1,
      limit = 10,
      kategori_id,
      is_published,
      is_highlight,
      search,
      dateFrom,
      dateTo,
    } = options;

    const whereConditions: string[] = [];
    const params: any[] = [];

    if (kategori_id) {
      whereConditions.push("b.kategori_id = ?");
      params.push(kategori_id);
    }

    if (is_published !== undefined) {
      whereConditions.push("b.is_published = ?");
      params.push(is_published ? 1 : 0);
    }

    if (is_highlight !== undefined) {
      whereConditions.push("b.is_highlight = ?");
      params.push(is_highlight ? 1 : 0);
    }

    if (search) {
      whereConditions.push("(b.judul LIKE ? OR b.excerpt LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (dateFrom) {
      whereConditions.push("DATE(b.created_at) >= ?");
      params.push(dateFrom);
    }

    if (dateTo) {
      whereConditions.push("DATE(b.created_at) <= ?");
      params.push(dateTo);
    }

    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";

    const { limitClause } = buildPagination(page, limit);

    const sql = `
      SELECT 
        b.*,
        k.nama as kategori_nama,
        k.slug as kategori_slug,
        k.color as kategori_color,
        u.name as author_name
      FROM berita b
      INNER JOIN kategori k ON b.kategori_id = k.id
      INNER JOIN users u ON b.author_id = u.id
      ${whereClause}
      ORDER BY b.created_at DESC
      ${limitClause}
    `;

    const data = await query<Berita>(sql, params);

    const countSql = `SELECT COUNT(*) as total FROM berita b ${whereClause}`;
    const countRow = await queryOne<any>(countSql, params);
    const total = countRow?.total ?? 0;

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get berita statistics
   */
  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN is_published = 0 THEN 1 ELSE 0 END) as unpublished
      FROM berita
    `;

    const result = await queryOne<any>(sql);

    return {
      total: result?.total || 0,
      published: result?.published || 0,
      unpublished: result?.unpublished || 0,
    };
  }

  /**
   * Get single berita by slug (published)
   */
  static async findBySlug(slug: string): Promise<Berita | null> {
    const sql = `
      SELECT 
        b.*,
        k.nama as kategori_nama,
        k.slug as kategori_slug,
        k.color as kategori_color,
        u.name as author_name
      FROM berita b
      INNER JOIN kategori k ON b.kategori_id = k.id
      INNER JOIN users u ON b.author_id = u.id
      WHERE b.slug = ? AND b.is_published = 1
      LIMIT 1
    `;

    return await queryOne<Berita>(sql, [slug]);
  }

  /**
   * Get single berita by ID
   */
  static async findById(id: string): Promise<Berita | null> {
    const sql = `
      SELECT 
        b.*,
        k.nama as kategori_nama,
        k.slug as kategori_slug,
        k.color as kategori_color,
        u.name as author_name
      FROM berita b
      INNER JOIN kategori k ON b.kategori_id = k.id
      INNER JOIN users u ON b.author_id = u.id
      WHERE b.id = ?
      LIMIT 1
    `;

    return await queryOne<Berita>(sql, [id]);
  }

  /**
   * Create new berita with logging
   */
  static async create(
    data: BeritaCreateInput,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    const id = generateUUID();
    const galeriJson = data.galeri ? JSON.stringify(data.galeri) : null;

    const sql = `
      INSERT INTO berita (
        id, judul, slug, excerpt, konten, featured_image, galeri,
        kategori_id, author_id, is_highlight, is_published, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      data.judul,
      data.slug,
      data.excerpt,
      data.konten,
      data.featured_image || null,
      galeriJson,
      data.kategori_id,
      data.author_id,
      data.is_highlight ? 1 : 0,
      data.is_published ? 1 : 0,
      data.published_at || null,
    ];

    await execute(sql, params);

    // Log aktivitas
    await createLogWithData({
      user_id: userId,
      aksi: "Create",
      modul: "Berita",
      detail_aksi: `Membuat berita baru: ${data.judul}`,
      data_sebelum: null,
      data_sesudah: { id, ...data },
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      endpoint: "/api/berita/tambah",
      method: "POST",
    });

    return id;
  }

  /**
   * Update berita with logging
   */
  static async update(
    id: string,
    data: BeritaUpdateInput,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<boolean> {
    // Get data before update for logging
    const dataBefore = await this.findById(id);

    const updates: string[] = [];
    const params: any[] = [];

    if (data.judul !== undefined) {
      updates.push("judul = ?");
      params.push(data.judul);
    }
    if (data.slug !== undefined) {
      updates.push("slug = ?");
      params.push(data.slug);
    }
    if (data.excerpt !== undefined) {
      updates.push("excerpt = ?");
      params.push(data.excerpt);
    }
    if (data.konten !== undefined) {
      updates.push("konten = ?");
      params.push(data.konten);
    }
    if (data.featured_image !== undefined) {
      updates.push("featured_image = ?");
      // Convert undefined to null for MySQL
      params.push(data.featured_image || null);
    }
    if (data.galeri !== undefined) {
      updates.push("galeri = ?");
      const galeriJson =
        data.galeri && data.galeri.length > 0
          ? JSON.stringify(data.galeri)
          : null;
      params.push(galeriJson);
    }
    if (data.kategori_id !== undefined) {
      updates.push("kategori_id = ?");
      params.push(data.kategori_id);
    }
    if (data.author_id !== undefined) {
      updates.push("author_id = ?");
      params.push(data.author_id);
    }
    if (data.is_highlight !== undefined) {
      updates.push("is_highlight = ?");
      params.push(data.is_highlight ? 1 : 0);
    }
    if (data.is_published !== undefined) {
      updates.push("is_published = ?");
      params.push(data.is_published ? 1 : 0);
    }
    if (data.published_at !== undefined) {
      updates.push("published_at = ?");
      // Convert undefined to null for MySQL
      params.push(data.published_at || null);
    }

    if (updates.length === 0) {
      return false;
    }

    params.push(id);
    const sql = `UPDATE berita SET ${updates.join(", ")} WHERE id = ?`;

    const result = await execute(sql, params);

    if (result.affectedRows > 0) {
      // Log aktivitas
      await createLogWithData({
        user_id: userId,
        aksi: "Update",
        modul: "Berita",
        detail_aksi: `Mengupdate berita: ${dataBefore?.judul || id}`,
        data_sebelum: dataBefore,
        data_sesudah: { id, ...data },
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        endpoint: `/api/berita/${id}`,
        method: "PUT",
      });
    }

    return result.affectedRows > 0;
  }

  /**
   * Delete berita with logging
   */
  static async delete(
    id: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<boolean> {
    const dataBefore = await this.findById(id);

    const sql = "DELETE FROM berita WHERE id = ?";
    const result = await execute(sql, [id]);

    if (result.affectedRows > 0 && dataBefore) {
      await createLogWithData({
        user_id: userId,
        aksi: "Delete",
        modul: "Berita",
        detail_aksi: `Menghapus berita: ${dataBefore.judul}`,
        data_sebelum: dataBefore,
        data_sesudah: null,
        ip_address: ipAddress,
        user_agent: userAgent,
        endpoint: `/api/berita/${id}`,
        method: "DELETE",
      });
    }

    return result.affectedRows > 0;
  }

  /**
   * Increment views
   */
  static async incrementViews(id: string): Promise<void> {
    const sql = "UPDATE berita SET views = views + 1 WHERE id = ?";
    await execute(sql, [id]);
  }

  /**
   * Get popular berita
   */
  static async getPopular(limit: number = 5): Promise<Berita[]> {
    const sql = `
      SELECT 
        b.*,
        k.nama as kategori_nama,
        k.slug as kategori_slug,
        k.color as kategori_color,
        u.name as author_name
      FROM berita b
      INNER JOIN kategori k ON b.kategori_id = k.id
      INNER JOIN users u ON b.author_id = u.id
      WHERE b.is_published = 1
      ORDER BY b.views DESC
      LIMIT ${parseInt(String(limit))}
    `;

    return await query<Berita>(sql, []);
  }

  /**
   * Get related berita
   */
  static async getRelated(
    kategori_id: string,
    excludeId: string,
    limit: number = 3
  ): Promise<Berita[]> {
    const sql = `
      SELECT 
        b.*,
        k.nama as kategori_nama,
        k.slug as kategori_slug,
        k.color as kategori_color,
        u.name as author_name
      FROM berita b
      INNER JOIN kategori k ON b.kategori_id = k.id
      INNER JOIN users u ON b.author_id = u.id
      WHERE b.kategori_id = ?
        AND b.id != ?
        AND b.is_published = 1
      ORDER BY b.created_at DESC
      LIMIT ${parseInt(String(limit))}
    `;

    return await query<Berita>(sql, [kategori_id, excludeId]);
  }
}
