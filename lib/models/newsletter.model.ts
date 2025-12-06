import { execute, query, queryOne } from "@/lib/db-helpers";
import {
  Newsletter,
  NewsletterCreateInput,
  NewsletterStats,
  NewsletterUpdateInput,
} from "@/lib/types";
import { createLogWithData } from "./log.model";
import { v4 as uuidv4 } from "uuid";

export async function getNewsletterStats(): Promise<NewsletterStats> {
  const [result] = await query<any>(
    `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive
      FROM newsletter
    `
  );

  return {
    total: Number(result?.total || 0),
    active: Number(result?.active || 0),
    inactive: Number(result?.inactive || 0),
  };
}

export async function getNewsletters(params: {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: number | string | null;
}): Promise<{
  newsletters: Newsletter[];
  total: number;
  currentPage: number;
  totalPages: number;
}> {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const search = params.search || "";
  const isActiveParam =
    params.is_active !== undefined && params.is_active !== null
      ? Number(params.is_active)
      : null;

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

  if (search) {
    conditions.push("email LIKE ?");
    queryParams.push(`%${search}%`);
  }

  if (isActiveParam !== null && !Number.isNaN(isActiveParam)) {
    conditions.push("is_active = ?");
    queryParams.push(isActiveParam);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const [countResult] = await query<any>(
    `SELECT COUNT(*) as total FROM newsletter ${whereClause}`,
    queryParams
  );

  const total = Number(countResult?.total || 0);
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));

  const newsletters = await query<Newsletter>(
    `
      SELECT
        id,
        email,
        is_active,
        subscribed_at,
        unsubscribed_at
      FROM newsletter
      ${whereClause}
      ORDER BY subscribed_at DESC
      LIMIT ? OFFSET ?
    `,
    [...queryParams, safeLimit, offset]
  );

  return {
    newsletters,
    total,
    currentPage: safePage,
    totalPages,
  };
}

export async function getNewsletterById(
  id: string
): Promise<Newsletter | null> {
  const newsletter = await queryOne<Newsletter>(
    `
      SELECT
        id,
        email,
        is_active,
        subscribed_at,
        unsubscribed_at
      FROM newsletter
      WHERE id = ?
    `,
    [id]
  );

  return newsletter || null;
}

export async function createNewsletter(
  data: NewsletterCreateInput,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const id = uuidv4();

  try {
    await execute(
      `
        INSERT INTO newsletter (
          id, email, is_active, subscribed_at, unsubscribed_at
        ) VALUES (?, ?, ?, ?, ?)
      `,
      [
        id,
        data.email,
        data.is_active !== undefined ? data.is_active : 1,
        data.subscribed_at || new Date(),
        data.unsubscribed_at ?? null,
      ]
    );
  } catch (error: any) {
    if (error?.code === "ER_DUP_ENTRY") {
      throw new Error("Email sudah terdaftar dalam newsletter");
    }
    throw error;
  }

  if (userId) {
    await createLogWithData({
      user_id: userId,
      aksi: "Create",
      modul: "newsletter",
      detail_aksi: `Menambahkan subscriber ${data.email}`,
      data_sebelum: null,
      data_sesudah: { id, ...data },
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      endpoint: "/api/newsletter",
      method: "POST",
    });
  }

  return id;
}

export async function updateNewsletter(
  id: string,
  data: NewsletterUpdateInput,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const existing = await getNewsletterById(id);
  if (!existing) {
    throw new Error("Newsletter tidak ditemukan");
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (data.email !== undefined) {
    updates.push("email = ?");
    params.push(data.email);
  }

  if (data.is_active !== undefined) {
    updates.push("is_active = ?");
    params.push(data.is_active);
  }

  let unsubscribedValue: Date | null | undefined = data.unsubscribed_at;
  if (data.is_active !== undefined && data.unsubscribed_at === undefined) {
    unsubscribedValue = data.is_active === 1 ? null : new Date();
  }

  if (unsubscribedValue !== undefined) {
    updates.push("unsubscribed_at = ?");
    params.push(unsubscribedValue);
  }

  if (!updates.length) {
    throw new Error("Tidak ada data yang diubah");
  }

  params.push(id);

  try {
    await execute(
      `UPDATE newsletter SET ${updates.join(", ")} WHERE id = ?`,
      params
    );
  } catch (error: any) {
    if (error?.code === "ER_DUP_ENTRY") {
      throw new Error("Email sudah terdaftar dalam newsletter");
    }
    throw error;
  }

  if (userId) {
    await createLogWithData({
      user_id: userId,
      aksi: "Update",
      modul: "newsletter",
      detail_aksi: `Memperbarui subscriber ${existing.email}`,
      data_sebelum: existing,
      data_sesudah: data,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      endpoint: "/api/newsletter/" + id,
      method: "PUT",
    });
  }
}

export async function deleteNewsletter(
  id: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const existing = await getNewsletterById(id);
  if (!existing) {
    throw new Error("Newsletter tidak ditemukan");
  }

  await execute(`DELETE FROM newsletter WHERE id = ?`, [id]);

  if (userId) {
    await createLogWithData({
      user_id: userId,
      aksi: "Delete",
      modul: "newsletter",
      detail_aksi: `Menghapus subscriber ${existing.email}`,
      data_sebelum: existing,
      data_sesudah: null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      endpoint: "/api/newsletter/" + id,
      method: "DELETE",
    });
  }
}
