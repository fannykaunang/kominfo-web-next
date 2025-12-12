// lib/models/log.model.ts
import { executeInsert, execute, query, queryOne } from "@/lib/db-helpers";
import { LogAktivitas, CreateLogInput } from "@/lib/types";

// ============================================
// LOG AKTIVITAS FUNCTIONS
// ============================================

/**
 * Create log aktivitas
 */
export async function createLog(input: CreateLogInput): Promise<void> {
  const sql = `
    INSERT INTO log_aktivitas (
      user_id, aksi, modul, detail_aksi, 
      ip_address, user_agent, endpoint, method
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    input.user_id,
    input.aksi,
    input.modul,
    input.detail_aksi,
    input.ip_address || null,
    input.user_agent || null,
    input.endpoint || null,
    input.method || null,
  ];

  await executeInsert(sql, params);
}

/**
 * Create log with data before/after
 */
export async function createLogWithData(
  input: CreateLogInput & {
    data_sebelum?: any;
    data_sesudah?: any;
  }
): Promise<void> {
  const sql = `
    INSERT INTO log_aktivitas (
      user_id, aksi, modul, detail_aksi,
      data_sebelum, data_sesudah,
      ip_address, user_agent, endpoint, method
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    input.user_id,
    input.aksi,
    input.modul,
    input.detail_aksi,
    input.data_sebelum ? JSON.stringify(input.data_sebelum) : null,
    input.data_sesudah ? JSON.stringify(input.data_sesudah) : null,
    input.ip_address || null,
    input.user_agent || null,
    input.endpoint || null,
    input.method || null,
  ];

  await executeInsert(sql, params);
}

/**
 * Get logs by user
 */
export async function getLogsByUser(
  userId: string,
  limit: number = 50
): Promise<LogAktivitas[]> {
  const sql = `
    SELECT * FROM log_aktivitas
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `;

  const { query } = await import("@/lib/db-helpers");
  return await query<LogAktivitas>(sql, [userId, limit]);
}

/**
 * Get logs by modul
 */
export async function getLogsByModul(
  modul: string,
  limit: number = 50
): Promise<LogAktivitas[]> {
  const sql = `
    SELECT * FROM log_aktivitas
    WHERE modul = ?
    ORDER BY created_at DESC
    LIMIT ?
  `;

  const { query } = await import("@/lib/db-helpers");
  return await query<LogAktivitas>(sql, [modul, limit]);
}

/**
 * Get recent logs
 */
export async function getRecentLogs(
  limit: number = 50
): Promise<LogAktivitas[]> {
  const sql = `
    SELECT 
      l.*,
      u.name as user_name,
      u.email as user_email
    FROM log_aktivitas l
    LEFT JOIN users u ON l.user_id = u.id
    ORDER BY l.created_at DESC
    LIMIT ?
  `;

  const { query } = await import("@/lib/db-helpers");
  return await query<LogAktivitas>(sql, [limit]);
}

/**
 * Delete old logs (cleanup)
 */
export async function deleteOldLogs(daysOld: number = 90): Promise<number> {
  const sql = `
    DELETE FROM log_aktivitas
    WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
  `;

  const result = await execute(sql, [daysOld]);
  return result.affectedRows;
}

/**
 * Get logs with pagination and filters (Server Side Friendly)
 */
export async function getLogs(params: {
  page?: number;
  limit?: number;
  search?: string;
  modul?: string;
  aksi?: string;
}): Promise<{
  logs: LogAktivitas[];
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}> {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const search = params.search || "";
  const modul = params.modul || "all";
  const aksi = params.aksi || "all";
  const offset = (page - 1) * limit;

  let whereClause = "WHERE 1=1";
  const queryParams: any[] = [];

  if (search) {
    whereClause +=
      " AND (user_name LIKE ? OR detail_aksi LIKE ? OR endpoint LIKE ?)";
    const searchParam = `%${search}%`;
    queryParams.push(searchParam, searchParam, searchParam);
  }

  if (modul !== "all") {
    whereClause += " AND modul = ?";
    queryParams.push(modul);
  }

  if (aksi !== "all") {
    whereClause += " AND aksi = ?";
    queryParams.push(aksi);
  }

  // Get Data
  const sql = `
    SELECT 
      l.log_id,
      l.user_id,
      l.aksi,
      l.modul,
      l.detail_aksi,
      l.endpoint,
      l.method,
      l.ip_address,
      l.created_at,
      u.name as user_name
    FROM log_aktivitas l
    LEFT JOIN users u ON l.user_id = u.id
    ${whereClause}
    ORDER BY l.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  // Get Total for Pagination
  const countSql = `
    SELECT COUNT(*) as total 
    FROM log_aktivitas l
    LEFT JOIN users u ON l.user_id = u.id
    ${whereClause}
  `;

  const [logs, countResult] = await Promise.all([
    query<LogAktivitas>(sql, queryParams),
    queryOne<{ total: number }>(countSql, queryParams),
  ]);

  const total = countResult?.total || 0;

  return {
    logs,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    limit,
  };
}

export async function getLogById(id: string): Promise<LogAktivitas | null> {
  const sql = `
    SELECT 
      l.*,
      u.name as user_name
    FROM log_aktivitas l
    LEFT JOIN users u ON l.user_id = u.id
    WHERE l.log_id = ?
  `;
  const result = await queryOne<LogAktivitas>(sql, [id]);
  return result;
}

/**
 * Get Log Statistics for Cards
 */
export async function getLogStats() {
  const sql = `
    SELECT 
      COUNT(*) as total,
      COUNT(DISTINCT modul) as uniqueModules,
      COUNT(DISTINCT aksi) as uniqueActions
    FROM log_aktivitas
  `;
  const stats = await queryOne<{
    total: number;
    uniqueModules: number;
    uniqueActions: number;
  }>(sql);

  return {
    total: stats?.total || 0,
    filtered: stats?.total || 0, // Initial load filtered equals total
    uniqueModules: stats?.uniqueModules || 0,
    uniqueActions: stats?.uniqueActions || 0,
  };
}

/**
 * Get Unique Modules and Actions for Filter Dropdowns
 */
export async function getLogFilters() {
  const [modules, actions] = await Promise.all([
    query<{ modul: string }>(
      "SELECT DISTINCT modul FROM log_aktivitas ORDER BY modul ASC"
    ),
    query<{ aksi: string }>(
      "SELECT DISTINCT aksi FROM log_aktivitas ORDER BY aksi ASC"
    ),
  ]);

  return {
    modules: modules.map((m) => m.modul),
    actions: actions.map((a) => a.aksi),
  };
}
