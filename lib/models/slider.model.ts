// lib/models/slider.model.ts

import { query } from "../db-helpers";
import { Slider } from "../types";

interface SliderFindOptions {
  is_published?: boolean;
  limit?: number;
}

export class SliderRepository {
  static async findAll(options: SliderFindOptions = {}): Promise<Slider[]> {
    const { is_published, limit } = options;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (is_published !== undefined) {
      conditions.push("is_published = ?");
      params.push(is_published ? 1 : 0);
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
}
