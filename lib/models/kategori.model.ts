import { query, queryOne, execute } from "../db-helpers";
import { Kategori } from "../types";
import { v4 as uuidv4 } from "uuid";

/**
 * Get all categories with optional search
 */
export async function getAllKategori(search?: string): Promise<Kategori[]> {
  let sql = `
    SELECT 
      k.*,
      COUNT(b.id) as berita_count
    FROM kategori k
    LEFT JOIN berita b ON k.id = b.kategori_id
  `;
  const params: any[] = [];

  if (search) {
    sql += ` WHERE k.nama LIKE ? OR k.slug LIKE ? OR k.deskripsi LIKE ?`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  sql += ` GROUP BY k.id ORDER BY k.created_at DESC`;

  return query<Kategori>(sql, params);
}

/**
 * Get all categories with optional search
 * Only counts published berita (is_published = 1)
 */
export async function getAllKategoriByNewsPublished(
  search?: string
): Promise<Kategori[]> {
  let sql = `
    SELECT 
      k.*,
      COUNT(b.id) as berita_count
    FROM kategori k
    LEFT JOIN berita b ON k.id = b.kategori_id AND b.is_published = 1
  `;
  const params: any[] = [];

  if (search) {
    sql += ` WHERE k.nama LIKE ? OR k.slug LIKE ? OR k.deskripsi LIKE ?`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  sql += ` GROUP BY k.id ORDER BY k.created_at DESC`;

  return query<Kategori>(sql, params);
}

/**
 * Get category by ID
 */
export async function getKategoriById(id: string): Promise<Kategori | null> {
  return queryOne<Kategori>(`SELECT * FROM kategori WHERE id = ?`, [id]);
}

/**
 * Get category by slug
 */
export async function getKategoriBySlug(
  slug: string
): Promise<Kategori | null> {
  return queryOne<Kategori>(`SELECT * FROM kategori WHERE slug = ?`, [slug]);
}

/**
 * Get category statistics
 */
export async function getKategoriStats() {
  const stats = await queryOne<any>(
    `
    SELECT 
      COUNT(DISTINCT k.id) as total,
      COUNT(DISTINCT CASE WHEN b.id IS NOT NULL THEN k.id END) as used,
      COUNT(DISTINCT CASE WHEN b.id IS NULL THEN k.id END) as unused
    FROM kategori k
    LEFT JOIN berita b ON k.id = b.kategori_id
    `
  );

  return {
    total: stats?.total || 0,
    used: stats?.used || 0,
    unused: stats?.unused || 0,
  };
}

/**
 * Create new category
 */
export async function createKategori(data: {
  nama: string;
  slug: string;
  deskripsi?: string;
  icon?: string;
  color?: string;
}): Promise<string> {
  const id = uuidv4();

  await execute(
    `
    INSERT INTO kategori (id, nama, slug, deskripsi, icon, color)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      data.nama,
      data.slug,
      data.deskripsi || null,
      data.icon || null,
      data.color || "#3b82f6",
    ]
  );

  return id;
}

/**
 * Update category
 */
export async function updateKategori(
  id: string,
  data: {
    nama?: string;
    slug?: string;
    deskripsi?: string;
    icon?: string;
    color?: string;
  }
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.nama !== undefined) {
    fields.push("nama = ?");
    values.push(data.nama);
  }
  if (data.slug !== undefined) {
    fields.push("slug = ?");
    values.push(data.slug);
  }
  if (data.deskripsi !== undefined) {
    fields.push("deskripsi = ?");
    values.push(data.deskripsi);
  }
  if (data.icon !== undefined) {
    fields.push("icon = ?");
    values.push(data.icon);
  }
  if (data.color !== undefined) {
    fields.push("color = ?");
    values.push(data.color);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  values.push(id);

  await execute(
    `UPDATE kategori SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}

/**
 * Delete category
 */
export async function deleteKategori(id: string): Promise<void> {
  // Check if category is being used
  const result = await queryOne<any>(
    `SELECT COUNT(*) as count FROM berita WHERE kategori_id = ?`,
    [id]
  );

  const count = result?.count || 0;

  if (count > 0) {
    throw new Error(
      `Kategori tidak dapat dihapus karena sedang digunakan oleh ${count} berita`
    );
  }

  await execute(`DELETE FROM kategori WHERE id = ?`, [id]);
}

/**
 * Check if slug exists (for validation)
 */
export async function isSlugExists(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  let sql = `SELECT COUNT(*) as count FROM kategori WHERE slug = ?`;
  const params: any[] = [slug];

  if (excludeId) {
    sql += ` AND id != ?`;
    params.push(excludeId);
  }

  const result = await queryOne<any>(sql, params);
  return (result?.count || 0) > 0;
}

/**
 * Get all categories with published berita count (for public pages)
 * Only counts berita that are published
 */
export async function getAllKategoriWithBeritaCount(): Promise<Kategori[]> {
  return query<Kategori>(
    `
    SELECT 
      k.*,
      COUNT(b.id) as berita_count
    FROM kategori k
    LEFT JOIN berita b ON k.id = b.kategori_id AND b.is_published = 1
    GROUP BY k.id
    ORDER BY k.nama ASC
    `
  );
}
