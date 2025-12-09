// lib/models/skpd.model.ts

import { execute, query } from "@/lib/db-helpers";
import { createLogWithData } from "./log.model";
import type { SKPD, SKPDInput } from "@/lib/types";

/**
 * Get all SKPD
 * @returns Array of all SKPD ordered by kategori and nama
 */
export async function getAllSKPD(): Promise<SKPD[]> {
  return await query<SKPD>("SELECT * FROM skpd ORDER BY kategori, nama");
}

/**
 * Get SKPD by ID
 * @param id - SKPD ID
 * @returns Single SKPD or null if not found
 */
export async function getSKPDById(id: number): Promise<SKPD | null> {
  const results = await query<SKPD>("SELECT * FROM skpd WHERE id = ?", [id]);
  return results[0] || null;
}

/**
 * Get SKPD by kategori
 * @param kategori - SKPD kategori (Sekretariat, Dinas, Badan, Inspektorat, Satuan)
 * @returns Array of SKPD in the kategori
 */
export async function getSKPDByKategori(kategori: string): Promise<SKPD[]> {
  return await query<SKPD>(
    "SELECT * FROM skpd WHERE kategori = ? ORDER BY nama",
    [kategori]
  );
}

/**
 * Search SKPD by name or singkatan
 * @param searchTerm - Search term
 * @returns Array of matching SKPD
 */
export async function searchSKPD(searchTerm: string): Promise<SKPD[]> {
  const searchPattern = `%${searchTerm}%`;
  return await query<SKPD>(
    `SELECT * FROM skpd 
     WHERE nama LIKE ? OR singkatan LIKE ? 
     ORDER BY kategori, nama`,
    [searchPattern, searchPattern]
  );
}

/**
 * Get SKPD count by kategori
 * @returns Object with kategori as key and count as value
 */
export async function getSKPDCountByKategori(): Promise<
  { kategori: string; jumlah: number }[]
> {
  return await query<{ kategori: string; jumlah: number }>(
    `SELECT kategori, COUNT(*) as jumlah 
     FROM skpd 
     GROUP BY kategori 
     ORDER BY jumlah DESC`
  );
}

/**
 * Create new SKPD
 * @param data - SKPD data
 * @returns Inserted SKPD ID
 */
export async function createSKPD(
  data: SKPDInput,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<number> {
  const result = await execute(
    `
    INSERT INTO skpd (nama, singkatan, kategori, alamat, telepon, email, website, kepala, deskripsi)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.nama,
      data.singkatan,
      data.kategori,
      data.alamat || null,
      data.telepon || null,
      data.email || null,
      data.website || null,
      data.kepala || null,
      data.deskripsi || null,
    ]
  );

  const id = result.insertId;

  // Log activity
  if (userId) {
    await createLogWithData({
      user_id: userId,
      aksi: "Create",
      modul: "SKPD",
      detail_aksi: `Membuat SKPD baru: ${data.nama}`,
      data_sebelum: null,
      data_sesudah: data,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      endpoint: "/api/skpd",
      method: "POST",
    });
  }

  return id;
}

/**
 * Update SKPD
 * @param id - SKPD ID
 * @param data - SKPD data to update
 * @returns Number of affected rows
 */
export async function updateSKPD(
  id: number,
  data: Partial<SKPDInput>,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<number> {
  const { execute } = await import("@/lib/db-helpers");

  const fields: string[] = [];
  const values: any[] = [];

  if (data.nama !== undefined) {
    fields.push("nama = ?");
    values.push(data.nama);
  }
  if (data.singkatan !== undefined) {
    fields.push("singkatan = ?");
    values.push(data.singkatan);
  }
  if (data.kategori !== undefined) {
    fields.push("kategori = ?");
    values.push(data.kategori);
  }
  if (data.alamat !== undefined) {
    fields.push("alamat = ?");
    values.push(data.alamat);
  }
  if (data.telepon !== undefined) {
    fields.push("telepon = ?");
    values.push(data.telepon);
  }
  if (data.email !== undefined) {
    fields.push("email = ?");
    values.push(data.email);
  }
  if (data.website !== undefined) {
    fields.push("website = ?");
    values.push(data.website);
  }
  if (data.kepala !== undefined) {
    fields.push("kepala = ?");
    values.push(data.kepala);
  }
  if (data.deskripsi !== undefined) {
    fields.push("deskripsi = ?");
    values.push(data.deskripsi);
  }

  // Tidak ada field yang diupdate
  if (fields.length === 0) {
    return 0;
  }

  values.push(id);

  const result = await execute(
    `UPDATE skpd SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  // Hanya log kalau ada baris yang berubah dan userId tersedia
  if (userId && result.affectedRows > 0) {
    await createLogWithData({
      user_id: userId,
      aksi: "Update",
      modul: "SKPD",
      detail_aksi: `Mengubah data SKPD dengan ID: ${id}`,
      // Kalau nanti kamu punya fungsi getSKPDById, bisa isi data_sebelum dengan data lama
      data_sebelum: null,
      data_sesudah: { id, ...data }, // data yang diupdate + id
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      endpoint: "/api/skpd",
      method: "PUT", // atau "PATCH" sesuai route kamu
    });
  }

  return result.affectedRows;
}

/**
 * Delete SKPD
 * @param id - SKPD ID
 * @returns Number of affected rows
 */
export async function deleteSKPD(
  id: number,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  // Get data for logging
  const skpd = await getSKPDById(id);

  await execute(`DELETE FROM skpd WHERE id = ?`, [id]);

  // Log activity
  if (userId && skpd) {
    await createLogWithData({
      user_id: userId,
      aksi: "Delete",
      modul: "halaman",
      detail_aksi: `Menghapus SKPD: ${skpd.nama}`,
      data_sebelum: skpd,
      data_sesudah: null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      endpoint: "/api/skpd/" + id,
      method: "DELETE",
    });
  }
}

/**
 * Get total SKPD count
 * @returns Total number of SKPD
 */
export async function getTotalSKPD(): Promise<number> {
  const result = await query<{ total: number }>(
    "SELECT COUNT(*) as total FROM skpd"
  );
  return result[0]?.total || 0;
}
