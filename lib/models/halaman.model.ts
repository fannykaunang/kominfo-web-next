import { query, execute } from "@/lib/db-helpers";
import { Halaman, HalamanCreateInput, HalamanUpdateInput } from "@/lib/types";
import { createLogWithData } from "./log.model";
import { v4 as uuidv4 } from "uuid";

// ============================================
// HALAMAN REPOSITORY
// ============================================

/**
 * Get all halaman with menu info
 */
export async function getAllHalaman(
  options: {
    menu_id?: string;
    is_published?: number;
    search?: string;
  } = {}
): Promise<Halaman[]> {
  const { menu_id, is_published, search } = options;

  let sql = `
    SELECT 
      h.*,
      m.nama as menu_nama,
      m.slug as menu_slug,
      u.name as author_name
    FROM halaman h
    INNER JOIN menu m ON h.menu_id = m.id
    LEFT JOIN users u ON h.author_id = u.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (menu_id) {
    sql += ` AND h.menu_id = ?`;
    params.push(menu_id);
  }

  if (is_published !== undefined) {
    sql += ` AND h.is_published = ?`;
    params.push(is_published);
  }

  if (search) {
    sql += ` AND (h.judul LIKE ? OR h.excerpt LIKE ? OR h.konten LIKE ?)`;
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  sql += `
    ORDER BY m.urutan ASC, h.urutan ASC, h.created_at DESC
  `;

  return query<Halaman>(sql, params);
}

/**
 * Get halaman by ID
 */
export async function getHalamanById(id: string): Promise<Halaman | null> {
  const sql = `
    SELECT 
      h.*,
      m.nama as menu_nama,
      m.slug as menu_slug,
      u.name as author_name
    FROM halaman h
    INNER JOIN menu m ON h.menu_id = m.id
    LEFT JOIN users u ON h.author_id = u.id
    WHERE h.id = ?
  `;
  const results = await query<Halaman>(sql, [id]);
  return results.length > 0 ? results[0] : null;
}

/**
 * Get halaman by slug
 */
export async function getHalamanBySlug(slug: string): Promise<Halaman | null> {
  const sql = `
    SELECT 
      h.*,
      m.nama as menu_nama,
      m.slug as menu_slug,
      u.name as author_name
    FROM halaman h
    INNER JOIN menu m ON h.menu_id = m.id
    LEFT JOIN users u ON h.author_id = u.id
    WHERE h.slug = ?
  `;
  const results = await query<Halaman>(sql, [slug]);
  return results.length > 0 ? results[0] : null;
}

/**
 * Get halaman by menu slug and halaman slug
 */
export async function getHalamanByMenuAndSlug(
  menuSlug: string,
  halamanSlug: string
): Promise<Halaman | null> {
  const sql = `
    SELECT 
      h.*,
      m.nama as menu_nama,
      m.slug as menu_slug,
      u.name as author_name
    FROM halaman h
    INNER JOIN menu m ON h.menu_id = m.id
    LEFT JOIN users u ON h.author_id = u.id
    WHERE m.slug = ? AND h.slug = ? AND h.is_published = 1
  `;
  const results = await query<Halaman>(sql, [menuSlug, halamanSlug]);

  if (results.length > 0) {
    // Increment views
    await incrementHalamanViews(results[0].id);
    return results[0];
  }

  return null;
}

/**
 * Get halaman by menu ID
 */
export async function getHalamanByMenuId(menuId: string): Promise<Halaman[]> {
  const sql = `
    SELECT * FROM halaman 
    WHERE menu_id = ? AND is_published = 1
    ORDER BY urutan ASC
  `;
  return query<Halaman>(sql, [menuId]);
}

/**
 * Get statistics
 */
export async function getHalamanStats(menu_id?: string) {
  let sql = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) as published,
      SUM(CASE WHEN is_published = 0 THEN 1 ELSE 0 END) as draft,
      SUM(views) as total_views
    FROM halaman
  `;
  const params: any[] = [];

  if (menu_id) {
    sql += ` WHERE menu_id = ?`;
    params.push(menu_id);
  }

  const results = await query<any>(sql, params);
  const stats = results[0];

  return {
    total: Number(stats?.total || 0),
    published: Number(stats?.published || 0),
    draft: Number(stats?.draft || 0),
    total_views: Number(stats?.total_views || 0),
  };
}

/**
 * Create new halaman
 */
export async function createHalaman(
  data: HalamanCreateInput,
  userId?: string
): Promise<string> {
  const id = uuidv4();

  await execute(
    `
    INSERT INTO halaman (
      id, menu_id, judul, slug, konten, excerpt,
      urutan, is_published, meta_title, meta_description, author_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      data.menu_id,
      data.judul,
      data.slug,
      data.konten,
      data.excerpt || null,
      data.urutan || 0,
      data.is_published !== undefined ? data.is_published : 1,
      data.meta_title || null,
      data.meta_description || null,
      data.author_id || userId || null,
    ]
  );

  // Log activity
  if (userId) {
    await createLogWithData({
      user_id: userId,
      aksi: "Create",
      modul: "halaman",
      detail_aksi: `Membuat halaman baru: ${data.judul}`,
      data_sebelum: null,
      data_sesudah: data,
    });
  }

  return id;
}

/**
 * Update halaman
 */
export async function updateHalaman(
  id: string,
  data: HalamanUpdateInput,
  userId?: string
): Promise<void> {
  // Get old data for logging
  const oldData = await getHalamanById(id);

  const updates: string[] = [];
  const params: any[] = [];

  if (data.menu_id !== undefined) {
    updates.push("menu_id = ?");
    params.push(data.menu_id);
  }
  if (data.judul !== undefined) {
    updates.push("judul = ?");
    params.push(data.judul);
  }
  if (data.slug !== undefined) {
    updates.push("slug = ?");
    params.push(data.slug);
  }
  if (data.konten !== undefined) {
    updates.push("konten = ?");
    params.push(data.konten);
  }
  if (data.excerpt !== undefined) {
    updates.push("excerpt = ?");
    params.push(data.excerpt);
  }
  if (data.urutan !== undefined) {
    updates.push("urutan = ?");
    params.push(data.urutan);
  }
  if (data.is_published !== undefined) {
    updates.push("is_published = ?");
    params.push(data.is_published);
  }
  if (data.meta_title !== undefined) {
    updates.push("meta_title = ?");
    params.push(data.meta_title);
  }
  if (data.meta_description !== undefined) {
    updates.push("meta_description = ?");
    params.push(data.meta_description);
  }
  if (data.author_id !== undefined) {
    updates.push("author_id = ?");
    params.push(data.author_id);
  }

  if (updates.length === 0) {
    throw new Error("No fields to update");
  }

  params.push(id);

  await execute(
    `UPDATE halaman SET ${updates.join(", ")} WHERE id = ?`,
    params
  );

  // Log activity
  if (userId && oldData) {
    await createLogWithData({
      user_id: userId,
      aksi: "Update",
      modul: "halaman",
      detail_aksi: `Mengupdate halaman: ${oldData.judul}`,
      data_sebelum: oldData,
      data_sesudah: data,
    });
  }
}

/**
 * Delete halaman
 */
export async function deleteHalaman(
  id: string,
  userId?: string
): Promise<void> {
  // Get data for logging
  const halaman = await getHalamanById(id);

  await execute(`DELETE FROM halaman WHERE id = ?`, [id]);

  // Log activity
  if (userId && halaman) {
    await createLogWithData({
      user_id: userId,
      aksi: "Delete",
      modul: "halaman",
      detail_aksi: `Menghapus halaman: ${halaman.judul}`,
      data_sebelum: halaman,
      data_sesudah: null,
    });
  }
}

/**
 * Increment views
 */
export async function incrementHalamanViews(id: string): Promise<void> {
  await execute(`UPDATE halaman SET views = views + 1 WHERE id = ?`, [id]);
}

/**
 * Toggle publish status
 */
export async function togglePublishHalaman(
  id: string,
  userId?: string
): Promise<void> {
  const halaman = await getHalamanById(id);
  if (!halaman) throw new Error("Halaman tidak ditemukan");

  const newStatus = halaman.is_published === 1 ? 0 : 1;
  await updateHalaman(id, { is_published: newStatus }, userId);
}

/**
 * Check if slug exists (for validation)
 */
export async function isHalamanSlugExists(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  let sql = `SELECT COUNT(*) as count FROM halaman WHERE slug = ?`;
  const params: any[] = [slug];

  if (excludeId) {
    sql += ` AND id != ?`;
    params.push(excludeId);
  }

  const results = await query<any>(sql, params);
  return Number(results[0].count) > 0;
}
