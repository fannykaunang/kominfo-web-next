// lib/models/statistik.model.ts

import { execute, query } from "../db-helpers";
import {
  Statistik,
  StatistikCreateInput,
  StatistikFilterOptions,
  StatistikUpdateInput,
} from "../types";
import { createLogWithData } from "./log.model";
import { v4 as uuidv4 } from "uuid";

interface RequestMeta {
  ip_address?: string | null;
  user_agent?: string | null;
  endpoint?: string | null;
  method?: string | null;
}

interface StatistikFindOptions {
  kategori?: string;
  limit?: number;
}

export class StatistikRepository {
  static async findAll(
    options: StatistikFindOptions & StatistikFilterOptions = {}
  ): Promise<Statistik[]> {
    const { kategori, limit, search } = options;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (kategori) {
      conditions.push("kategori = ?");
      params.push(kategori);
    }

    if (search) {
      conditions.push("(judul LIKE ? OR kategori LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";
    const hasLimit = typeof limit === "number" && Number.isFinite(limit);
    const limitClause = hasLimit
      ? `LIMIT ${Math.max(0, Math.floor(limit))}`
      : "";

    const sql = `
      SELECT
        id,
        judul,
        nilai,
        satuan,
        icon,
        kategori,
        urutan,
        created_at,
        updated_at
      FROM statistik
      ${whereClause}
      ORDER BY urutan ASC, created_at DESC
      ${limitClause}
    `;

    return query<Statistik>(sql, params);
  }

  static async findById(id: string): Promise<Statistik | null> {
    const sql = `
      SELECT
        id,
        judul,
        nilai,
        satuan,
        icon,
        kategori,
        urutan,
        created_at,
        updated_at
      FROM statistik
      WHERE id = ?
      LIMIT 1
    `;

    const results = await query<Statistik>(sql, [id]);
    return results[0] || null;
  }

  static async createStatistik(
    data: StatistikCreateInput,
    userId: string,
    meta: RequestMeta = {}
  ): Promise<string> {
    const id = uuidv4();

    const sql = `
      INSERT INTO statistik (
        id, judul, nilai, satuan, icon, kategori, urutan
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      data.judul,
      data.nilai,
      data.satuan ?? null,
      data.icon ?? null,
      data.kategori,
      data.urutan ?? 0,
    ];

    await execute(sql, params);

    await createLogWithData({
      user_id: userId,
      aksi: "Create",
      modul: "statistik",
      detail_aksi: `Membuat statistik baru: ${data.judul}`,
      data_sebelum: null,
      data_sesudah: { id, ...data, urutan: data.urutan ?? 0 },
      ip_address: meta.ip_address,
      user_agent: meta.user_agent,
      endpoint: meta.endpoint,
      method: meta.method,
    });

    return id;
  }

  static async updateStatistik(
    id: string,
    data: StatistikUpdateInput,
    userId: string,
    meta: RequestMeta = {}
  ): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("Statistik tidak ditemukan");
    }

    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (data.judul !== undefined) {
      updates.push("judul = ?");
      params.push(data.judul);
    }
    if (data.nilai !== undefined) {
      updates.push("nilai = ?");
      params.push(data.nilai);
    }
    if (data.satuan !== undefined) {
      updates.push("satuan = ?");
      params.push(data.satuan ?? null);
    }
    if (data.icon !== undefined) {
      updates.push("icon = ?");
      params.push(data.icon ?? null);
    }
    if (data.kategori !== undefined) {
      updates.push("kategori = ?");
      params.push(data.kategori);
    }
    if (data.urutan !== undefined) {
      updates.push("urutan = ?");
      params.push(data.urutan ?? 0);
    }

    if (updates.length === 0) {
      return;
    }

    const sql = `
      UPDATE statistik
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    params.push(id);

    await execute(sql, params);

    const updated = await this.findById(id);

    await createLogWithData({
      user_id: userId,
      aksi: "Update",
      modul: "statistik",
      detail_aksi: `Memperbarui statistik: ${existing.judul}`,
      data_sebelum: existing,
      data_sesudah: updated,
      ip_address: meta.ip_address,
      user_agent: meta.user_agent,
      endpoint: meta.endpoint,
      method: meta.method,
    });
  }

  static async deleteStatistik(
    id: string,
    userId: string,
    meta: RequestMeta = {}
  ): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("Statistik tidak ditemukan");
    }

    await execute(`DELETE FROM statistik WHERE id = ?`, [id]);

    await createLogWithData({
      user_id: userId,
      aksi: "Delete",
      modul: "statistik",
      detail_aksi: `Menghapus statistik: ${existing.judul}`,
      data_sebelum: existing,
      data_sesudah: null,
      ip_address: meta.ip_address,
      user_agent: meta.user_agent,
      endpoint: meta.endpoint,
      method: meta.method,
    });
  }
}
