import { query, queryOne, execute } from "@/lib/db-helpers";
import { v4 as uuidv4 } from "uuid";
import { Tag, TagStats, TagWithBerita, BeritaTag } from "@/lib/types";
import { createLogWithData } from "./log.model";

// Generate slug from nama
function generateSlug(nama: string): string {
  return nama
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Get all tags with filters
export async function getTags(params: {
  page?: number;
  limit?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  used?: string;
}): Promise<{ tags: Tag[]; total: number }> {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const search = params.search || "";
  const startDate = params.start_date || "";
  const endDate = params.end_date || "";
  const used = params.used || "all";

  // Sanitize pagination inputs
  const safePage =
    Number.isFinite(Number(page)) && Number(page) > 0
      ? Math.floor(Number(page))
      : 1;
  const safeLimit =
    Number.isFinite(Number(limit)) && Number(limit) > 0
      ? Math.floor(Number(limit))
      : 20;
  const offset = (safePage - 1) * safeLimit;

  const conditions: string[] = [];
  const queryParams: any[] = [];

  // Search filter
  if (search) {
    conditions.push("(t.nama LIKE ? OR t.slug LIKE ?)");
    queryParams.push(`%${search}%`, `%${search}%`);
  }

  // Date range filter
  if (startDate) {
    conditions.push("DATE(t.created_at) >= ?");
    queryParams.push(startDate);
  }

  if (endDate) {
    conditions.push("DATE(t.created_at) <= ?");
    queryParams.push(endDate);
  }

  // Used/unused filter
  if (used === "used") {
    conditions.push("COALESCE(bt.berita_count, 0) > 0");
  } else if (used === "unused") {
    conditions.push("COALESCE(bt.berita_count, 0) = 0");
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Get total count
  const [countResult] = await query<any>(
    `SELECT COUNT(*) as total 
     FROM (
       SELECT t.id
       FROM tags t
       LEFT JOIN (
         SELECT bt.tag_id, COUNT(DISTINCT b.id) as berita_count
         FROM berita_tags bt
         INNER JOIN berita b ON bt.berita_id = b.id
         GROUP BY bt.tag_id
       ) bt ON t.id = bt.tag_id
       ${whereClause}
     ) as filtered`,
    queryParams
  );

  const total = countResult?.total || 0;

  // Get tags with berita count (only count existing berita)
  const tags = await query<Tag>(
    `SELECT 
      t.id,
      t.nama,
      t.slug,
      t.created_at,
      COALESCE(bt.berita_count, 0) as berita_count,
      CASE WHEN COALESCE(bt.berita_count, 0) > 0 THEN 1 ELSE 0 END as is_used
    FROM tags t
    LEFT JOIN (
      SELECT bt.tag_id, COUNT(DISTINCT b.id) as berita_count
      FROM berita_tags bt
      INNER JOIN berita b ON bt.berita_id = b.id
      GROUP BY bt.tag_id
    ) bt ON t.id = bt.tag_id
    ${whereClause}
    ORDER BY t.created_at DESC
    LIMIT ${safeLimit} OFFSET ${offset}`,
    queryParams
  );

  return { tags, total };
}

// Get tag stats
export async function getTagStats(): Promise<TagStats> {
  const [totalResult] = await query<any>(`SELECT COUNT(*) as total FROM tags`);

  const [usedResult] = await query<any>(
    `SELECT COUNT(DISTINCT bt.tag_id) as used 
     FROM berita_tags bt
     INNER JOIN berita b ON bt.berita_id = b.id`
  );

  const total = totalResult?.total || 0;
  const used = usedResult?.used || 0;
  const unused = total - used;

  return { total, used, unused };
}

// Get single tag by ID
export async function getTagById(id: string): Promise<Tag | null> {
  const tag = await queryOne<Tag>(
    `SELECT 
      t.id,
      t.nama,
      t.slug,
      t.created_at,
      COALESCE(bt.berita_count, 0) as berita_count,
      CASE WHEN COALESCE(bt.berita_count, 0) > 0 THEN 1 ELSE 0 END as is_used
    FROM tags t
    LEFT JOIN (
      SELECT bt.tag_id, COUNT(DISTINCT b.id) as berita_count
      FROM berita_tags bt
      INNER JOIN berita b ON bt.berita_id = b.id
      GROUP BY bt.tag_id
    ) bt ON t.id = bt.tag_id
    WHERE t.id = ?`,
    [id]
  );

  return tag;
}

// Get berita using this tag
export async function getBeritaByTagId(tagId: string): Promise<BeritaTag[]> {
  const berita = await query<BeritaTag>(
    `SELECT 
      b.id,
      b.judul,
      b.slug,
      b.thumbnail,
      k.nama as kategori_nama,
      b.published_at,
      b.created_at
    FROM berita b
    INNER JOIN berita_tags bt ON b.id = bt.berita_id
    LEFT JOIN kategori k ON b.kategori_id = k.id
    WHERE bt.tag_id = ?
    ORDER BY b.created_at DESC`,
    [tagId]
  );

  return berita;
}

// Check if tag name exists
export async function tagNameExists(
  nama: string,
  excludeId?: string
): Promise<boolean> {
  const conditions = ["nama = ?"];
  const params: any[] = [nama];

  if (excludeId) {
    conditions.push("id != ?");
    params.push(excludeId);
  }

  const tag = await queryOne<any>(
    `SELECT id FROM tags WHERE ${conditions.join(" AND ")}`,
    params
  );

  return !!tag;
}

// Check if tag slug exists
export async function tagSlugExists(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const conditions = ["slug = ?"];
  const params: any[] = [slug];

  if (excludeId) {
    conditions.push("id != ?");
    params.push(excludeId);
  }

  const tag = await queryOne<any>(
    `SELECT id FROM tags WHERE ${conditions.join(" AND ")}`,
    params
  );

  return !!tag;
}

// Create new tag
export async function createTag(data: {
  nama: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<Tag> {
  const id = uuidv4();
  let slug = generateSlug(data.nama);

  // Ensure unique slug
  let counter = 1;
  let finalSlug = slug;
  while (await tagSlugExists(finalSlug)) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  await execute(
    `INSERT INTO tags (id, nama, slug, created_at)
     VALUES (?, ?, ?, NOW())`,
    [id, data.nama, finalSlug]
  );

  // Log activity menggunakan createLogWithData
  if (data.userId) {
    await createLogWithData({
      user_id: data.userId,
      aksi: "Create",
      modul: "Tags",
      detail_aksi: `Membuat tag baru: ${data.nama}`,
      data_sebelum: null,
      data_sesudah: { id, nama: data.nama, slug: finalSlug },
      ip_address: data.ipAddress || null,
      user_agent: data.userAgent || null,
      endpoint: "/api/tags",
      method: "POST",
    });
  }

  return {
    id,
    nama: data.nama,
    slug: finalSlug,
    created_at: new Date().toISOString(),
    berita_count: 0,
    is_used: false,
  } as Tag;
}

// Update tag
export async function updateTag(
  id: string,
  data: {
    nama: string;
    userId?: string;
    userName?: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<Tag> {
  // Get old data for logging
  const oldTag = await getTagById(id);
  if (!oldTag) {
    throw new Error("Tag tidak ditemukan");
  }

  let slug = generateSlug(data.nama);

  // Ensure unique slug (exclude current tag)
  let counter = 1;
  let finalSlug = slug;
  while (await tagSlugExists(finalSlug, id)) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  await execute(`UPDATE tags SET nama = ?, slug = ? WHERE id = ?`, [
    data.nama,
    finalSlug,
    id,
  ]);

  // Log activity menggunakan createLogWithData
  if (data.userId) {
    await createLogWithData({
      user_id: data.userId,
      aksi: "Update",
      modul: "Tags",
      detail_aksi: `Mengubah tag: ${oldTag.nama} → ${data.nama}`,
      data_sebelum: { nama: oldTag.nama, slug: oldTag.slug },
      data_sesudah: { nama: data.nama, slug: finalSlug },
      ip_address: data.ipAddress || null,
      user_agent: data.userAgent || null,
      endpoint: `/api/tags/${id}`,
      method: "PUT",
    });
  }

  return {
    id,
    nama: data.nama,
    slug: finalSlug,
    created_at: oldTag.created_at,
    berita_count: oldTag.berita_count,
    is_used: oldTag.is_used,
  } as Tag;
}

// Delete tag
export async function deleteTag(
  id: string,
  data: {
    userId?: string;
    userName?: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  // Get tag data before delete
  const tag = await getTagById(id);
  if (!tag) {
    throw new Error("Tag tidak ditemukan");
  }

  // Check if tag is used
  if (tag.berita_count && tag.berita_count > 0) {
    throw new Error(
      `Tag ini digunakan di ${tag.berita_count} berita. Hapus relasi terlebih dahulu.`
    );
  }

  await execute(`DELETE FROM tags WHERE id = ?`, [id]);

  // Log activity menggunakan createLogWithData
  if (data.userId) {
    await createLogWithData({
      user_id: data.userId,
      aksi: "Delete",
      modul: "Tags",
      detail_aksi: `Menghapus tag: ${tag.nama}`,
      data_sebelum: { id, nama: tag.nama, slug: tag.slug },
      data_sesudah: null,
      ip_address: data.ipAddress || null,
      user_agent: data.userAgent || null,
      endpoint: `/api/tags/${id}`,
      method: "DELETE",
    });
  }
}

// Get tag by slug
export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const tag = await queryOne<Tag>(
    `SELECT 
      t.id,
      t.nama,
      t.slug,
      t.created_at,
      COALESCE(bt.berita_count, 0) as berita_count,
      CASE WHEN COALESCE(bt.berita_count, 0) > 0 THEN 1 ELSE 0 END as is_used
    FROM tags t
    LEFT JOIN (
      SELECT bt.tag_id, COUNT(DISTINCT b.id) as berita_count
      FROM berita_tags bt
      INNER JOIN berita b ON bt.berita_id = b.id
      GROUP BY bt.tag_id
    ) bt ON t.id = bt.tag_id
    WHERE t.slug = ?`,
    [slug]
  );

  return tag;
}

/**
 * Clean up orphan records in berita_tags
 * (Remove berita_tags records that reference deleted berita)
 */
export async function cleanupOrphanBeritaTags(): Promise<number> {
  const result = await execute(
    `DELETE bt FROM berita_tags bt
     LEFT JOIN berita b ON bt.berita_id = b.id
     WHERE b.id IS NULL`
  );

  return result.affectedRows;
}

/**
 * Get count of orphan records
 */
export async function getOrphanBeritaTagsCount(): Promise<number> {
  const [result] = await query<any>(
    `SELECT COUNT(*) as count
     FROM berita_tags bt
     LEFT JOIN berita b ON bt.berita_id = b.id
     WHERE b.id IS NULL`
  );

  return result?.count || 0;
}

/**
 * Get all tags (simple list for dropdown/select)
 */
export async function getAllTags(): Promise<Tag[]> {
  return await query<Tag>(`SELECT id, nama, slug FROM tags ORDER BY nama ASC`);
}

/**
 * Get all tags (simple list for dropdown/select)
 * Tanpa pagination, untuk keperluan dropdown
 */
export async function getAllTagsSimple(): Promise<Tag[]> {
  return await query<Tag>(`SELECT id, nama, slug FROM tags ORDER BY nama ASC`);
}

/**
 * Get tags by berita ID
 */
export async function getTagsByBeritaId(beritaId: string): Promise<Tag[]> {
  return await query<Tag>(
    `SELECT t.id, t.nama, t.slug, t.created_at
     FROM tags t
     INNER JOIN berita_tags bt ON t.id = bt.tag_id
     WHERE bt.berita_id = ?
     ORDER BY t.nama ASC`,
    [beritaId]
  );
}
