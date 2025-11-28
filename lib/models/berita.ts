import {
  query,
  queryOne,
  execute,
  generateUUID,
  buildWhereClause,
  buildPagination,
} from "../db-helpers";
import { RowDataPacket } from "mysql2/promise";

// Types
export interface Berita extends RowDataPacket {
  id: string;
  judul: string;
  slug: string;
  excerpt: string;
  konten: string;
  featured_image: string | null;
  galeri: string | null;
  views: number;
  is_highlight: boolean;
  is_published: boolean;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
  kategori_id: string;
  author_id: string;
  // Joined fields
  kategori_nama?: string;
  kategori_slug?: string;
  kategori_color?: string;
  author_name?: string;
}

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
  published_at?: Date;
}

export interface BeritaUpdateInput extends Partial<BeritaCreateInput> {}

// Repository class
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
    } = {}
  ) {
    const {
      page = 1,
      limit = 10,
      kategori_id,
      is_published,
      is_highlight,
      search,
    } = options;

    let whereConditions: string[] = [];
    let params: any[] = [];

    if (kategori_id) {
      whereConditions.push("b.kategori_id = ?");
      params.push(kategori_id);
    }

    if (is_published !== undefined) {
      whereConditions.push("b.is_published = ?");
      params.push(is_published);
    }

    if (is_highlight !== undefined) {
      whereConditions.push("b.is_highlight = ?");
      params.push(is_highlight);
    }

    if (search) {
      whereConditions.push("(b.judul LIKE ? OR b.excerpt LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";

    const { offset, limitClause } = buildPagination(page, limit);

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

    const results = await query<Berita>(sql, params);

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM berita b ${whereClause}`;
    const [{ total }] = await query<any>(countSql, params);

    return {
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single berita by slug
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
   * Create new berita
   */
  static async create(data: BeritaCreateInput): Promise<string> {
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
      data.is_highlight || false,
      data.is_published || false,
      data.published_at || null,
    ];

    await execute(sql, params);
    return id;
  }

  /**
   * Update berita
   */
  static async update(id: string, data: BeritaUpdateInput): Promise<boolean> {
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
      params.push(data.featured_image);
    }
    if (data.galeri !== undefined) {
      updates.push("galeri = ?");
      params.push(JSON.stringify(data.galeri));
    }
    if (data.kategori_id !== undefined) {
      updates.push("kategori_id = ?");
      params.push(data.kategori_id);
    }
    if (data.is_highlight !== undefined) {
      updates.push("is_highlight = ?");
      params.push(data.is_highlight);
    }
    if (data.is_published !== undefined) {
      updates.push("is_published = ?");
      params.push(data.is_published);
    }
    if (data.published_at !== undefined) {
      updates.push("published_at = ?");
      params.push(data.published_at);
    }

    if (updates.length === 0) return false;

    params.push(id);
    const sql = `UPDATE berita SET ${updates.join(", ")} WHERE id = ?`;

    const result = await execute(sql, params);
    return result.affectedRows > 0;
  }

  /**
   * Delete berita
   */
  static async delete(id: string): Promise<boolean> {
    const sql = "DELETE FROM berita WHERE id = ?";
    const result = await execute(sql, [id]);
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
        k.color as kategori_color
      FROM berita b
      INNER JOIN kategori k ON b.kategori_id = k.id
      WHERE b.is_published = 1
      ORDER BY b.views DESC
      LIMIT ?
    `;

    return await query<Berita>(sql, [limit]);
  }

  /**
   * Get related berita by kategori
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
        k.color as kategori_color
      FROM berita b
      INNER JOIN kategori k ON b.kategori_id = k.id
      WHERE b.kategori_id = ? AND b.id != ? AND b.is_published = 1
      ORDER BY b.created_at DESC
      LIMIT ?
    `;

    return await query<Berita>(sql, [kategori_id, excludeId, limit]);
  }
}
