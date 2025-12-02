import { query, execute } from "@/lib/db-helpers";
import {
  Galeri,
  GaleriCreateInput,
  GaleriUpdateInput,
  GaleriFilterOptions,
} from "@/lib/types";
import { createLogWithData } from "./log.model";
import { v4 as uuidv4 } from "uuid";

type GaleriStats = {
  total: number;
  published: number;
  draft: number;
  total_images: number;
  total_videos: number;
  total_views: number;
};

// Get all galeri with filters
export async function getAllGaleri(options: GaleriFilterOptions = {}) {
  const { search, kategori, media_type, is_published } = options;

  let sql = `
    SELECT * FROM galeri
    WHERE 1=1
  `;
  const params: any[] = [];

  if (search) {
    sql += ` AND (judul LIKE ? OR deskripsi LIKE ? OR kategori LIKE ?)`;
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  if (kategori) {
    sql += ` AND kategori = ?`;
    params.push(kategori);
  }

  if (media_type) {
    sql += ` AND media_type = ?`;
    params.push(media_type);
  }

  if (is_published !== undefined && is_published !== "all") {
    sql += ` AND is_published = ?`;
    params.push(parseInt(is_published));
  }

  sql += ` ORDER BY urutan ASC, created_at DESC`;

  const galeri = await query<Galeri>(sql, params);
  return galeri;
}

// Get galeri by ID
export async function getGaleriById(id: string): Promise<Galeri | null> {
  const sql = `SELECT * FROM galeri WHERE id = ?`;
  const result = await query<Galeri>(sql, [id]); // perhatikan: Galeri, bukan Galeri[]
  return result[0] ?? null;
}

// Get galeri stats
export async function getGaleriStats(
  options: { kategori?: string; media_type?: string } = {}
): Promise<GaleriStats> {
  const { kategori, media_type } = options;

  let whereClause = "WHERE 1=1";
  const params: any[] = [];

  if (kategori) {
    whereClause += " AND kategori = ?";
    params.push(kategori);
  }

  if (media_type) {
    whereClause += " AND media_type = ?";
    params.push(media_type);
  }

  const sql = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) as published,
      SUM(CASE WHEN is_published = 0 THEN 1 ELSE 0 END) as draft,
      SUM(CASE WHEN media_type = 'image' THEN 1 ELSE 0 END) as total_images,
      SUM(CASE WHEN media_type = 'video' THEN 1 ELSE 0 END) as total_videos,
      SUM(views) as total_views
    FROM galeri
    ${whereClause}
  `;

  const result = await query<GaleriStats>(sql, params);
  return (
    result[0] || {
      total: 0,
      published: 0,
      draft: 0,
      total_images: 0,
      total_videos: 0,
      total_views: 0,
    }
  );
}

// Get unique categories
export async function getGaleriKategori() {
  const sql = `
    SELECT DISTINCT kategori 
    FROM galeri 
    WHERE kategori IS NOT NULL AND kategori != ''
    ORDER BY kategori ASC
  `;
  const result = await query<{ kategori: string }>(sql);
  return result.map((row) => row.kategori);
}

// Create galeri
export async function createGaleri(data: GaleriCreateInput, userId: string) {
  const id = uuidv4();

  // Convert array to JSON string for images
  let mediaUrlToStore: string;
  if (data.media_type === "image" && Array.isArray(data.media_url)) {
    mediaUrlToStore = JSON.stringify(data.media_url);
  } else {
    mediaUrlToStore =
      typeof data.media_url === "string" ? data.media_url : data.media_url[0];
  }

  const sql = `
    INSERT INTO galeri (id, judul, deskripsi, media_type, media_url, thumbnail, kategori, is_published, urutan)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    id,
    data.judul,
    data.deskripsi || null,
    data.media_type,
    mediaUrlToStore,
    data.thumbnail || null,
    data.kategori,
    data.is_published !== undefined ? data.is_published : 1,
    data.urutan || 0,
  ];

  await execute(sql, params);

  // Log activity
  await createLogWithData({
    user_id: userId,
    aksi: "CREATE",
    modul: "galeri",
    detail_aksi: `Membuat galeri baru: ${data.judul}`,
    data_sebelum: null,
    data_sesudah: { ...data, media_url: mediaUrlToStore },
  });

  return id;
}

// Update galeri
export async function updateGaleri(
  id: string,
  data: GaleriUpdateInput,
  userId: string
) {
  // Get existing data for logging
  const existing = await getGaleriById(id);
  if (!existing) {
    throw new Error("Galeri not found");
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (data.judul !== undefined) {
    updates.push("judul = ?");
    params.push(data.judul);
  }

  if (data.deskripsi !== undefined) {
    updates.push("deskripsi = ?");
    params.push(data.deskripsi || null);
  }

  if (data.media_type !== undefined) {
    updates.push("media_type = ?");
    params.push(data.media_type);
  }

  if (data.media_url !== undefined) {
    updates.push("media_url = ?");
    // Convert array to JSON string for images
    if (Array.isArray(data.media_url)) {
      params.push(JSON.stringify(data.media_url));
    } else {
      params.push(data.media_url);
    }
  }

  if (data.thumbnail !== undefined) {
    updates.push("thumbnail = ?");
    params.push(data.thumbnail || null);
  }

  if (data.kategori !== undefined) {
    updates.push("kategori = ?");
    params.push(data.kategori);
  }

  if (data.is_published !== undefined) {
    updates.push("is_published = ?");
    params.push(data.is_published);
  }

  if (data.urutan !== undefined) {
    updates.push("urutan = ?");
    params.push(data.urutan);
  }

  if (updates.length === 0) {
    return;
  }

  params.push(id);
  const sql = `UPDATE galeri SET ${updates.join(", ")} WHERE id = ?`;

  await execute(sql, params);

  // Log activity
  await createLogWithData({
    user_id: userId,
    aksi: "UPDATE",
    modul: "galeri",
    detail_aksi: `Mengupdate galeri: ${existing.judul}`,
    data_sebelum: existing,
    data_sesudah: { ...existing, ...data },
  });
}

// Delete galeri
export async function deleteGaleri(id: string, userId: string) {
  // Get existing data for logging
  const existing = await getGaleriById(id);
  if (!existing) {
    throw new Error("Galeri not found");
  }

  const sql = `DELETE FROM galeri WHERE id = ?`;
  await execute(sql, [id]);

  // Log activity
  await createLogWithData({
    user_id: userId,
    aksi: "DELETE",
    modul: "galeri",
    detail_aksi: `Menghapus galeri: ${existing.judul}`,
    data_sebelum: existing,
    data_sesudah: null,
  });
}

// Toggle publish
export async function togglePublishGaleri(id: string, userId: string) {
  const existing = await getGaleriById(id);
  if (!existing) {
    throw new Error("Galeri not found");
  }

  const newStatus = existing.is_published === 1 ? 0 : 1;
  await updateGaleri(id, { is_published: newStatus }, userId);

  return newStatus;
}

// Increment views
export async function incrementGaleriViews(id: string) {
  const sql = `UPDATE galeri SET views = views + 1 WHERE id = ?`;
  await execute(sql, [id]);
}

// Get published galeri for frontend
export async function getPublishedGaleri(
  options: { kategori?: string; media_type?: string; limit?: number } = {}
) {
  const { kategori, media_type, limit } = options;

  let sql = `
    SELECT * FROM galeri
    WHERE is_published = 1
  `;
  const params: any[] = [];

  if (kategori) {
    sql += ` AND kategori = ?`;
    params.push(kategori);
  }

  if (media_type) {
    sql += ` AND media_type = ?`;
    params.push(media_type);
  }

  sql += ` ORDER BY urutan ASC, created_at DESC`;

  if (limit) {
    sql += ` LIMIT ?`;
    params.push(limit);
  }

  return await query<Galeri[]>(sql, params);
}
