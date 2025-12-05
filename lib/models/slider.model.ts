// lib/models/slider.model.ts

import { query, execute } from "../db-helpers";
import { Slider, SliderCreateInput, SliderUpdateInput } from "../types";
import { v4 as uuidv4 } from "uuid";
import { createLogWithData } from "./log.model";

export interface SliderFindOptions {
  is_published?: number | boolean;
  limit?: number;
  search?: string;
}

export class SliderRepository {
  static async findAll(options: SliderFindOptions = {}): Promise<Slider[]> {
    const { is_published, limit, search } = options;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (is_published !== undefined) {
      conditions.push("is_published = ?");
      params.push(is_published ? 1 : 0);
    }

    if (search) {
      conditions.push("(judul LIKE ? OR deskripsi LIKE ?)");
      const pattern = `%${search}%`;
      params.push(pattern, pattern);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";
    const limitClause = limit ? "LIMIT ?" : "";

    if (limit) {
      params.push(limit);
    }

    const sql = `
      SELECT
        id,
        judul,
        deskripsi,
        image,
        is_published,
        created_at
      FROM slider
      ${whereClause}
      ORDER BY created_at DESC
      ${limitClause}
    `;

    return query<Slider>(sql, params);
  }

  static async findById(id: string): Promise<Slider | null> {
    const results = await query<Slider>(
      `SELECT id, judul, deskripsi, image, is_published, created_at FROM slider WHERE id = ?`,
      [id]
    );
    return results[0] || null;
  }

  static async getStats() {
    const result = await query<any>(
      `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN is_published = 0 THEN 1 ELSE 0 END) as draft
      FROM slider
    `
    );

    const stats = result[0];
    return {
      total: Number(stats?.total || 0),
      published: Number(stats?.published || 0),
      draft: Number(stats?.draft || 0),
    };
  }

  static async create(
    data: SliderCreateInput,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    const id = uuidv4();

    await execute(
      `
      INSERT INTO slider (
        id, judul, deskripsi, image, is_published
      ) VALUES (?, ?, ?, ?, ?)
    `,
      [
        id,
        data.judul,
        data.deskripsi || null,
        data.image,
        data.is_published !== undefined ? data.is_published : 0,
      ]
    );

    if (userId) {
      await createLogWithData({
        user_id: userId,
        aksi: "Create",
        modul: "slider",
        detail_aksi: `Membuat slider baru: ${data.judul}`,
        data_sebelum: null,
        data_sesudah: data,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        endpoint: "/api/slider",
        method: "POST",
      });
    }

    return id;
  }

  static async update(
    id: string,
    data: SliderUpdateInput,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const oldData = await SliderRepository.findById(id);
    if (!oldData) throw new Error("Slider tidak ditemukan");

    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (data.judul !== undefined) {
      updates.push("judul = ?");
      params.push(data.judul);
    }
    if (data.deskripsi !== undefined) {
      updates.push("deskripsi = ?");
      params.push(data.deskripsi);
    }
    if (data.image !== undefined) {
      updates.push("image = ?");
      params.push(data.image);
    }
    if (data.is_published !== undefined) {
      updates.push("is_published = ?");
      params.push(data.is_published);
    }

    if (!updates.length) return;

    params.push(id);

    await execute(
      `UPDATE slider SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    if (userId) {
      await createLogWithData({
        user_id: userId,
        aksi: "Update",
        modul: "slider",
        detail_aksi: `Mengupdate slider: ${oldData.judul}`,
        data_sebelum: oldData,
        data_sesudah: { ...oldData, ...data },
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        endpoint: "/api/slider/" + id,
        method: "PUT",
      });
    }
  }

  static async delete(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const slider = await SliderRepository.findById(id);
    await execute(`DELETE FROM slider WHERE id = ?`, [id]);

    if (userId && slider) {
      await createLogWithData({
        user_id: userId,
        aksi: "Delete",
        modul: "slider",
        detail_aksi: `Menghapus slider: ${slider.judul}`,
        data_sebelum: slider,
        data_sesudah: null,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        endpoint: "/api/slider/" + id,
        method: "DELETE",
      });
    }
  }
}

export async function togglePublishSlider(
  id: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
) {
  const slider = await SliderRepository.findById(id);
  if (!slider) throw new Error("Slider tidak ditemukan");
  const newStatus = slider.is_published === 1 ? 0 : 1;
  await SliderRepository.update(
    id,
    { is_published: newStatus },
    userId,
    ipAddress,
    userAgent
  );
}
