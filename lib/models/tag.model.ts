import { query, queryOne, execute } from "@/lib/db-helpers";
import { v4 as uuidv4 } from "uuid";
import { Tag, TagStats, TagWithBerita, BeritaTag } from "@/lib/types";

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
  const offset = (page - 1) * limit;
  const search = params.search || "";
  const startDate = params.start_date || "";
  const endDate = params.end_date || "";
  const used = params.used || "all";

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
    conditions.push("berita_count > 0");
  } else if (used === "unused") {
    conditions.push("berita_count = 0");
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
         SELECT tag_id, COUNT(*) as berita_count
         FROM berita_tags
         GROUP BY tag_id
       ) bt ON t.id = bt.tag_id
       ${whereClause}
     ) as filtered`,
    queryParams
  );

  const total = countResult?.total || 0;

  // Get tags with berita count
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
      SELECT tag_id, COUNT(*) as berita_count
      FROM berita_tags
      GROUP BY tag_id
    ) bt ON t.id = bt.tag_id
    ${whereClause}
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?`,
    [...queryParams, limit, offset]
  );

  return { tags, total };
}

// Get tag stats
export async function getTagStats(): Promise<TagStats> {
  const [totalResult] = await query<any>(`SELECT COUNT(*) as total FROM tags`);

  const [usedResult] = await query<any>(
    `SELECT COUNT(DISTINCT tag_id) as used FROM berita_tags`
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
      SELECT tag_id, COUNT(*) as berita_count
      FROM berita_tags
      GROUP BY tag_id
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
  userId: string;
  userName: string;
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

  // Log activity
  await execute(
    `INSERT INTO log_aktivitas (
      id, user_id, user_name, aksi, modul, detail_aksi,
      endpoint, ip_address, user_agent, data_sesudah, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      uuidv4(),
      data.userId,
      data.userName,
      "Create",
      "Tags",
      `Membuat tag baru: ${data.nama}`,
      "POST /api/backend/tags",
      data.ipAddress || null,
      data.userAgent || null,
      JSON.stringify({ id, nama: data.nama, slug: finalSlug }),
    ]
  );

  return {
    id,
    nama: data.nama,
    slug: finalSlug,
    created_at: new Date().toISOString(),
    berita_count: 0,
    is_used: false,
  };
}

// Update tag
export async function updateTag(
  id: string,
  data: {
    nama: string;
    userId: string;
    userName: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<Tag> {
  // Get old data
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

  // Log activity
  await execute(
    `INSERT INTO log_aktivitas (
      id, user_id, user_name, aksi, modul, detail_aksi,
      endpoint, ip_address, user_agent, 
      data_sebelum, data_sesudah, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      uuidv4(),
      data.userId,
      data.userName,
      "Update",
      "Tags",
      `Mengubah tag: ${oldTag.nama} → ${data.nama}`,
      "PUT /api/backend/tags/" + id,
      data.ipAddress || null,
      data.userAgent || null,
      JSON.stringify({ nama: oldTag.nama, slug: oldTag.slug }),
      JSON.stringify({ nama: data.nama, slug: finalSlug }),
    ]
  );

  return {
    id,
    nama: data.nama,
    slug: finalSlug,
    created_at: oldTag.created_at,
    berita_count: oldTag.berita_count,
    is_used: oldTag.is_used,
  };
}

// Delete tag
export async function deleteTag(
  id: string,
  data: {
    userId: string;
    userName: string;
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

  // Log activity
  await execute(
    `INSERT INTO log_aktivitas (
      id, user_id, user_name, aksi, modul, detail_aksi,
      endpoint, ip_address, user_agent, data_sebelum, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      uuidv4(),
      data.userId,
      data.userName,
      "Delete",
      "Tags",
      `Menghapus tag: ${tag.nama}`,
      "DELETE /api/backend/tags/" + id,
      data.ipAddress || null,
      data.userAgent || null,
      JSON.stringify({ id, nama: tag.nama, slug: tag.slug }),
    ]
  );
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
      SELECT tag_id, COUNT(*) as berita_count
      FROM berita_tags
      GROUP BY tag_id
    ) bt ON t.id = bt.tag_id
    WHERE t.slug = ?`,
    [slug]
  );

  return tag;
}
