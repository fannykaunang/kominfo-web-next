import { query, execute } from "@/lib/db-helpers";
import { Menu, MenuCreateInput, MenuUpdateInput } from "@/lib/types";
import { createLogWithData } from "./log.model";
import { v4 as uuidv4 } from "uuid";

// ============================================
// MENU REPOSITORY
// ============================================

/**
 * Get all menu with halaman count
 */
export async function getAllMenu(
  options: {
    is_published?: number;
    search?: string;
  } = {}
): Promise<Menu[]> {
  const { is_published, search } = options;

  let sql = `
    SELECT 
      m.*,
      COUNT(h.id) as halaman_count
    FROM menu m
    LEFT JOIN halaman h ON m.id = h.menu_id AND h.is_published = 1
    WHERE 1=1
  `;
  const params: any[] = [];

  if (is_published !== undefined) {
    sql += ` AND m.is_published = ?`;
    params.push(is_published);
  }

  if (search) {
    sql += ` AND (m.nama LIKE ? OR m.slug LIKE ? OR m.deskripsi LIKE ?)`;
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  sql += `
    GROUP BY m.id
    ORDER BY m.urutan ASC, m.created_at DESC
  `;

  return query<Menu>(sql, params);
}

/**
 * Get menu by ID
 */
export async function getMenuById(id: string): Promise<Menu | null> {
  const results = await query<Menu>(`SELECT * FROM menu WHERE id = ?`, [id]);
  return results.length > 0 ? results[0] : null;
}

/**
 * Get menu by slug
 */
export async function getMenuBySlug(slug: string): Promise<Menu | null> {
  const results = await query<Menu>(`SELECT * FROM menu WHERE slug = ?`, [
    slug,
  ]);
  return results.length > 0 ? results[0] : null;
}

/**
 * Get statistics
 */
export async function getMenuStats() {
  const result = await query<any>(
    `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) as published,
      SUM(CASE WHEN is_published = 0 THEN 1 ELSE 0 END) as draft
    FROM menu
  `
  );

  const stats = result[0];

  return {
    total: Number(stats?.total || 0),
    published: Number(stats?.published || 0),
    draft: Number(stats?.draft || 0),
  };
}

/**
 * Create new menu
 */
export async function createMenu(
  data: MenuCreateInput,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const id = uuidv4();

  await execute(
    `
    INSERT INTO menu (
      id, nama, slug, icon, urutan, 
      is_published, deskripsi
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      id,
      data.nama,
      data.slug,
      data.icon || null,
      data.urutan || 0,
      data.is_published !== undefined ? data.is_published : 1,
      data.deskripsi || null,
    ]
  );

  // Log activity
  if (userId) {
    await createLogWithData({
      user_id: userId,
      aksi: "Create",
      modul: "menu",
      detail_aksi: `Membuat menu baru: ${data.nama}`,
      data_sebelum: null,
      data_sesudah: data,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      endpoint: "/api/menu",
      method: "POST",
    });
  }

  return id;
}

/**
 * Update menu
 */
export async function updateMenu(
  id: string,
  data: MenuUpdateInput,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  // Get old data for logging
  const oldData = await getMenuById(id);

  const updates: string[] = [];
  const params: any[] = [];

  if (data.nama !== undefined) {
    updates.push("nama = ?");
    params.push(data.nama);
  }
  if (data.slug !== undefined) {
    updates.push("slug = ?");
    params.push(data.slug);
  }
  if (data.icon !== undefined) {
    updates.push("icon = ?");
    params.push(data.icon);
  }
  if (data.urutan !== undefined) {
    updates.push("urutan = ?");
    params.push(data.urutan);
  }
  if (data.is_published !== undefined) {
    updates.push("is_published = ?");
    params.push(data.is_published);
  }
  if (data.deskripsi !== undefined) {
    updates.push("deskripsi = ?");
    params.push(data.deskripsi);
  }

  if (updates.length === 0) {
    throw new Error("No fields to update");
  }

  params.push(id);

  await execute(`UPDATE menu SET ${updates.join(", ")} WHERE id = ?`, params);

  // Log activity
  if (userId && oldData) {
    await createLogWithData({
      user_id: userId,
      aksi: "Update",
      modul: "menu",
      detail_aksi: `Mengupdate menu: ${oldData.nama}`,
      data_sebelum: oldData,
      data_sesudah: data,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      endpoint: "/api/menu/" + id,
      method: "PUT",
    });
  }
}

/**
 * Delete menu (will cascade delete halaman)
 */
export async function deleteMenu(
  id: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  // Get data for logging
  const menu = await getMenuById(id);

  await execute(`DELETE FROM menu WHERE id = ?`, [id]);

  // Log activity
  if (userId && menu) {
    await createLogWithData({
      user_id: userId,
      aksi: "Delete",
      modul: "menu",
      detail_aksi: `Menghapus menu: ${menu.nama}`,
      data_sebelum: menu,
      data_sesudah: null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      endpoint: "/api/menu/" + id,
      method: "DELETE",
    });
  }
}

/**
 * Toggle publish status
 */
export async function togglePublishMenu(
  id: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const menu = await getMenuById(id);
  if (!menu) throw new Error("Menu tidak ditemukan");

  const newStatus = menu.is_published === 1 ? 0 : 1;
  await updateMenu(id, { is_published: newStatus }, userId);
}

/**
 * Check if slug exists (for validation)
 */
export async function isMenuSlugExists(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  let sql = `SELECT COUNT(*) as count FROM menu WHERE slug = ?`;
  const params: any[] = [slug];

  if (excludeId) {
    sql += ` AND id != ?`;
    params.push(excludeId);
  }

  const results = await query<any>(sql, params);
  return Number(results[0].count) > 0;
}

/**
 * Get published menu for frontend (with halaman)
 */
export async function getPublishedMenuWithHalaman(): Promise<any[]> {
  const sql = `
    SELECT 
      m.id,
      m.nama,
      m.slug,
      m.icon,
      m.urutan,
      h.id as halaman_id,
      h.judul as halaman_judul,
      h.slug as halaman_slug,
      h.urutan as halaman_urutan
    FROM menu m
    LEFT JOIN halaman h ON m.id = h.menu_id AND h.is_published = 1
    WHERE m.is_published = 1
    ORDER BY m.urutan ASC, h.urutan ASC
  `;

  const results = await query<any>(sql);

  // Group by menu
  const menuMap = new Map();

  results.forEach((row) => {
    if (!menuMap.has(row.id)) {
      menuMap.set(row.id, {
        id: row.id,
        nama: row.nama,
        slug: row.slug,
        icon: row.icon,
        urutan: row.urutan,
        halaman: [],
      });
    }

    if (row.halaman_id) {
      menuMap.get(row.id).halaman.push({
        id: row.halaman_id,
        judul: row.halaman_judul,
        slug: row.halaman_slug,
        urutan: row.halaman_urutan,
      });
    }
  });

  return Array.from(menuMap.values());
}
