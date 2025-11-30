// lib/models/log.model.ts
import { executeInsert, execute } from "@/lib/db-helpers";
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
