// lib/models/komentar.model.ts

import { buildPagination, execute, query, queryOne } from "@/lib/db-helpers";
import {
  Komentar,
  KomentarStats,
  KomentarWithBerita,
  PaginationResult,
} from "@/lib/types";
import { createLogWithData } from "./log.model";

export interface KomentarFindOptions {
  page?: number;
  limit?: number;
  search?: string;
  is_approved?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

interface RequestMeta {
  ip_address?: string | null;
  user_agent?: string | null;
  endpoint?: string | null;
  method?: string | null;
}

export class KomentarRepository {
  /**
   * Get all komentar with pagination and filters
   */
  static async findAll(
    options: KomentarFindOptions = {}
  ): Promise<PaginationResult<KomentarWithBerita>> {
    const {
      page = 1,
      limit = 10,
      search,
      is_approved,
      dateFrom,
      dateTo,
    } = options;

    const whereConditions: string[] = [];
    const params: any[] = [];

    if (search) {
      whereConditions.push(
        "(k.nama LIKE ? OR k.email LIKE ? OR k.konten LIKE ? OR b.judul LIKE ?)"
      );
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (is_approved !== undefined) {
      whereConditions.push("k.is_approved = ?");
      params.push(is_approved ? 1 : 0);
    }

    if (dateFrom) {
      whereConditions.push("DATE(k.created_at) >= ?");
      params.push(dateFrom);
    }

    if (dateTo) {
      whereConditions.push("DATE(k.created_at) <= ?");
      params.push(dateTo);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const { limitClause } = buildPagination(page, limit);

    const sql = `
      SELECT
        k.*, 
        b.judul as berita_judul,
        b.slug as berita_slug,
        b.excerpt as berita_excerpt,
        b.featured_image as berita_featured_image,
        b.konten as berita_konten
      FROM komentar k
      INNER JOIN berita b ON k.berita_id = b.id
      ${whereClause}
      ORDER BY k.created_at DESC
      ${limitClause}
    `;

    const data = await query<KomentarWithBerita>(sql, params);

    const countSql = `SELECT COUNT(*) as total FROM komentar k INNER JOIN berita b ON k.berita_id = b.id ${whereClause}`;
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
   * Get single komentar with berita detail
   */
  static async findById(id: string): Promise<KomentarWithBerita | null> {
    const sql = `
      SELECT
        k.*, 
        b.judul as berita_judul,
        b.slug as berita_slug,
        b.excerpt as berita_excerpt,
        b.featured_image as berita_featured_image,
        b.konten as berita_konten
      FROM komentar k
      INNER JOIN berita b ON k.berita_id = b.id
      WHERE k.id = ?
      LIMIT 1
    `;

    return await queryOne<KomentarWithBerita>(sql, [id]);
  }

  /**
   * Get komentar statistics
   */
  static async getStats(): Promise<KomentarStats> {
    const sql = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_approved = 1 THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN is_approved = 0 THEN 1 ELSE 0 END) as notApproved
      FROM komentar
    `;

    const result = await queryOne<any>(sql);

    return {
      total: result?.total || 0,
      approved: result?.approved || 0,
      notApproved: result?.notApproved || 0,
    };
  }

  /**
   * Approve komentar
   */
  static async approveKomentar(
    id: string,
    actorId: string | null,
    meta: RequestMeta = {}
  ): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("Komentar tidak ditemukan");
    }

    await execute(`UPDATE komentar SET is_approved = 1 WHERE id = ?`, [id]);

    await createLogWithData({
      user_id: actorId,
      aksi: "Update",
      modul: "Komentar",
      detail_aksi: `Menyetujui komentar oleh ${existing.nama}`,
      data_sebelum: existing,
      data_sesudah: { ...existing, is_approved: 1 },
      ...meta,
    });
  }

  /**
   * Delete komentar
   */
  static async deleteKomentar(
    id: string,
    actorId: string | null,
    meta: RequestMeta = {}
  ): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("Komentar tidak ditemukan");
    }

    await execute(`DELETE FROM komentar WHERE id = ?`, [id]);

    await createLogWithData({
      user_id: actorId,
      aksi: "Delete",
      modul: "Komentar",
      detail_aksi: `Menghapus komentar oleh ${existing.nama}`,
      data_sebelum: existing,
      data_sesudah: null,
      ...meta,
    });
  }
}
