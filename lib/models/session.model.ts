// lib/models/session.model.ts

import { execute, query, queryOne } from "@/lib/db-helpers";
import { v4 as uuidv4 } from "uuid";
import {
  Session,
  SessionWithUser,
  SessionCreateInput,
  SessionFilterOptions,
  RevokedSession,
  PaginationResult,
} from "@/lib/types";
import { createLogWithData } from "./log.model";
import crypto from "crypto";

/**
 * Hash token for storage (SHA256)
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Create new session
 */
export async function createSession(data: SessionCreateInput): Promise<string> {
  const id = uuidv4();

  await execute(
    `INSERT INTO sessions (
      id, user_id, token_hash, ip_address, user_agent, 
      device_info, location, expires_at, login_at, last_activity_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      id,
      data.user_id,
      data.token_hash,
      data.ip_address,
      data.user_agent || null,
      data.device_info || null,
      data.location || null,
      data.expires_at,
    ]
  );

  return id;
}

/**
 * Get all sessions with user info (paginated)
 */
export async function getAllSessions(
  filters: SessionFilterOptions = {},
  page: number = 1,
  limit: number = 20
): Promise<PaginationResult<SessionWithUser>> {
  // Ensure limit & offset are valid numbers for prepared statements
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 20;
  const offset = (page - 1) * safeLimit;
  let whereConditions: string[] = [];
  let params: any[] = [];

  // Search by user name or email
  if (filters.search) {
    whereConditions.push("(u.name LIKE ? OR u.email LIKE ?)");
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm);
  }

  // Filter by user_id
  if (filters.user_id) {
    whereConditions.push("s.user_id = ?");
    params.push(filters.user_id);
  }

  // Filter by active status
  if (filters.is_active !== undefined) {
    whereConditions.push("s.is_active = ?");
    params.push(filters.is_active === "true" ? 1 : 0);
  }

  // Filter by IP address
  if (filters.ip_address) {
    whereConditions.push("s.ip_address = ?");
    params.push(filters.ip_address);
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  // Get total count
  const countResult = await queryOne<{ total: number }>(
    `SELECT COUNT(*) as total 
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     ${whereClause}`,
    params
  );

  const total = countResult?.total || 0;

  // Get sessions
  const sessions = await query<SessionWithUser>(
    `SELECT
      s.*,
      u.name as user_name,
      u.email as user_email,
      u.role as user_role,
      u.avatar as user_avatar
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     ${whereClause}
     ORDER BY s.last_activity_at DESC
    LIMIT ${safeLimit} OFFSET ${offset}`,
    params
  );

  return {
    data: sessions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get session by token hash
 */
export async function getSessionByTokenHash(
  tokenHash: string
): Promise<Session | null> {
  return await queryOne<Session>(
    `SELECT * FROM sessions WHERE token_hash = ? AND is_active = 1`,
    [tokenHash]
  );
}

/**
 * Get sessions by user ID
 */
export async function getSessionsByUserId(userId: string): Promise<Session[]> {
  return await query<Session>(
    `SELECT * FROM sessions 
     WHERE user_id = ? AND is_active = 1 
     ORDER BY last_activity_at DESC`,
    [userId]
  );
}

/**
 * Check if session is revoked (blacklisted)
 */
export async function isSessionRevoked(tokenHash: string): Promise<boolean> {
  const revoked = await queryOne<RevokedSession>(
    `SELECT id FROM revoked_sessions WHERE token_hash = ?`,
    [tokenHash]
  );
  return !!revoked;
}

/**
 * Update session last activity
 */
export async function updateSessionActivity(tokenHash: string): Promise<void> {
  await execute(
    `UPDATE sessions SET last_activity_at = NOW() WHERE token_hash = ?`,
    [tokenHash]
  );
}

/**
 * Revoke session (kick user)
 */
export async function revokeSession(
  sessionId: string,
  revokedBy: string,
  reason?: string
): Promise<void> {
  // Get session
  const session = await queryOne<Session>(
    `SELECT * FROM sessions WHERE id = ?`,
    [sessionId]
  );

  if (!session) {
    throw new Error("Session not found");
  }

  // Add to blacklist
  const revokedId = uuidv4();
  await execute(
    `INSERT INTO revoked_sessions (id, session_id, token_hash, user_id, revoked_by, reason)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      revokedId,
      sessionId,
      session.token_hash,
      session.user_id,
      revokedBy,
      reason || "Kicked by admin",
    ]
  );

  // Mark session as inactive
  await execute(`UPDATE sessions SET is_active = 0 WHERE id = ?`, [sessionId]);

  // Log activity
  await createLogWithData({
    user_id: revokedBy,
    aksi: "Revoke_Session",
    modul: "sessions",
    detail_aksi: `Kicked session: ${sessionId}`,
    data_sebelum: session,
    data_sesudah: { ...session, is_active: 0 },
  });
}

/**
 * Revoke session and ban user (kick + deactivate)
 */
export async function revokeSessionAndBanUser(
  sessionId: string,
  revokedBy: string,
  reason?: string
): Promise<void> {
  // Get session
  const session = await queryOne<Session>(
    `SELECT * FROM sessions WHERE id = ?`,
    [sessionId]
  );

  if (!session) {
    throw new Error("Session not found");
  }

  // Revoke all user sessions
  const userSessions = await query<Session>(
    `SELECT * FROM sessions WHERE user_id = ? AND is_active = 1`,
    [session.user_id]
  );

  for (const userSession of userSessions) {
    const revokedId = uuidv4();
    await execute(
      `INSERT INTO revoked_sessions (id, session_id, token_hash, user_id, revoked_by, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        revokedId,
        userSession.id,
        userSession.token_hash,
        userSession.user_id,
        revokedBy,
        reason || "User banned by admin",
      ]
    );
  }

  // Mark all sessions as inactive
  await execute(`UPDATE sessions SET is_active = 0 WHERE user_id = ?`, [
    session.user_id,
  ]);

  // Deactivate user
  await execute(`UPDATE users SET is_active = 0 WHERE id = ?`, [
    session.user_id,
  ]);

  // Log activity
  await createLogWithData({
    user_id: revokedBy,
    aksi: "BAN_USER",
    modul: "sessions",
    detail_aksi: `Banned user and revoked all sessions: ${session.user_id}`,
    data_sebelum: { user_id: session.user_id, sessions: userSessions },
    data_sesudah: { user_id: session.user_id, is_active: 0 },
  });
}

/**
 * Cleanup expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  // Mark expired sessions as inactive
  const result = await execute(
    `UPDATE sessions SET is_active = 0 WHERE expires_at < NOW() AND is_active = 1`
  );

  // Delete old revoked sessions (older than 30 days)
  await execute(
    `DELETE FROM revoked_sessions WHERE revoked_at < DATE_SUB(NOW(), INTERVAL 30 DAY)`
  );

  return result.affectedRows || 0;
}

/**
 * Get session statistics
 */
export async function getSessionStats() {
  const stats = await queryOne<{
    total: number;
    active: number;
    inactive: number;
    expired: number;
  }>(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive,
      SUM(CASE WHEN expires_at < NOW() THEN 1 ELSE 0 END) as expired
     FROM sessions`
  );

  const suspiciousResult = await queryOne<{ suspicious: number }>(
    `SELECT COUNT(DISTINCT user_id) as suspicious
     FROM sessions
     WHERE is_active = 1
     GROUP BY user_id
     HAVING COUNT(*) > 3 OR COUNT(DISTINCT ip_address) > 2`
  );

  return {
    total: stats?.total || 0,
    active: stats?.active || 0,
    inactive: stats?.inactive || 0,
    expired: stats?.expired || 0,
    suspicious: suspiciousResult?.suspicious || 0,
  };
}

/**
 * Get suspicious sessions (multiple IPs, many sessions)
 */
export async function getSuspiciousSessions(): Promise<SessionWithUser[]> {
  return await query<SessionWithUser>(
    `SELECT 
      s.*,
      u.name as user_name,
      u.email as user_email,
      u.role as user_role,
      u.avatar as user_avatar,
      COUNT(DISTINCT s.ip_address) as ip_count,
      COUNT(s.id) as session_count
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.is_active = 1
     GROUP BY s.user_id
     HAVING session_count > 3 OR ip_count > 2
     ORDER BY session_count DESC, ip_count DESC`
  );
}
