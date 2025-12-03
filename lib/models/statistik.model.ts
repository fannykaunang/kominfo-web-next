// lib/models/statistik.model.ts

import { query } from "../db-helpers";
import { Statistik } from "../types";

interface StatistikFindOptions {
  kategori?: string;
  limit?: number;
}

export class StatistikRepository {
  static async findAll(
    options: StatistikFindOptions = {}
  ): Promise<Statistik[]> {
    const { kategori, limit } = options;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (kategori) {
      conditions.push("kategori = ?");
      params.push(kategori);
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
}
