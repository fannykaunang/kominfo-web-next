import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { query, queryOne, execute } from "@/lib/db-helpers";
import {
  User,
  SafeUser,
  UserCreateInput,
  UserUpdateInput,
  UserFilterOptions,
  PaginationResult,
} from "@/lib/types";
import { createLogWithData } from "./log.model";

/**
 * Get all users with filters and pagination
 */
export async function getAllUsers(
  filters: UserFilterOptions = {},
  page: number = 1,
  limit: number = 10
): Promise<PaginationResult<SafeUser>> {
  const { search, role, is_active, email_verified } = filters;

  // Ensure valid pagination values to avoid database parameter errors
  const safePage =
    Number.isInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const safeLimit =
    Number.isInteger(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10;

  let whereClause = "WHERE 1=1";
  const params: any[] = [];

  if (search) {
    whereClause += " AND (name LIKE ? OR email LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  if (role) {
    whereClause += " AND role = ?";
    params.push(role);
  }

  if (is_active !== undefined && is_active !== "all") {
    whereClause += " AND is_active = ?";
    params.push(is_active === "true" ? 1 : 0);
  }

  if (email_verified !== undefined && email_verified !== "all") {
    whereClause += " AND email_verified = ?";
    params.push(email_verified === "true" ? 1 : 0);
  }

  // Get total count
  const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
  const countResult = await queryOne<{ total: number }>(countQuery, params);
  const total = countResult?.total || 0;

  // Get paginated data
  const offset = Math.max(0, (safePage - 1) * safeLimit);
  const dataQuery = `
    SELECT id, name, email, role, avatar, is_active, email_verified,
           last_login_at, created_at, updated_at
    FROM users
    ${whereClause}
    ORDER BY created_at DESC
     LIMIT ${Number(safeLimit)} OFFSET ${Number(offset)}
  `;

  const users = await query<SafeUser>(dataQuery, params);

  return {
    data: users,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit),
    },
  };
}

/**
 * Get user by ID (without password)
 */
export async function getUserById(id: string): Promise<SafeUser | null> {
  const sql = `
    SELECT id, name, email, role, avatar, is_active, email_verified, 
           last_login_at, created_at, updated_at
    FROM users 
    WHERE id = ?
  `;
  return await queryOne<SafeUser>(sql, [id]);
}

/**
 * Get user by email (with password - for auth)
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const sql = "SELECT * FROM users WHERE email = ?";
  return await queryOne<User>(sql, [email]);
}

/**
 * Get user stats
 */
export async function getUserStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
  admin: number;
  editor: number;
  author: number;
  verified: number;
  unverified: number;
}> {
  const sql = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive,
      SUM(CASE WHEN role = 'ADMIN' THEN 1 ELSE 0 END) as admin,
      SUM(CASE WHEN role = 'EDITOR' THEN 1 ELSE 0 END) as editor,
      SUM(CASE WHEN role = 'AUTHOR' THEN 1 ELSE 0 END) as author,
      SUM(CASE WHEN email_verified = 1 THEN 1 ELSE 0 END) as verified,
      SUM(CASE WHEN email_verified = 0 THEN 1 ELSE 0 END) as unverified
    FROM users
  `;
  const result = await queryOne<any>(sql);
  return {
    total: Number(result?.total || 0),
    active: Number(result?.active || 0),
    inactive: Number(result?.inactive || 0),
    admin: Number(result?.admin || 0),
    editor: Number(result?.editor || 0),
    author: Number(result?.author || 0),
    verified: Number(result?.verified || 0),
    unverified: Number(result?.unverified || 0),
  };
}

/**
 * Create new user
 */
export async function createUser(
  data: UserCreateInput,
  actorId: string | null = null
): Promise<string> {
  const id = uuidv4();

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const sql = `
    INSERT INTO users (id, name, email, password, role, avatar, is_active, email_verified)
    VALUES (?, ?, ?, ?, ?, ?, 1, 0)
  `;

  await execute(sql, [
    id,
    data.name,
    data.email,
    hashedPassword,
    data.role,
    data.avatar || null,
  ]);

  // Log activity
  await createLogWithData({
    user_id: actorId,
    aksi: "Create",
    modul: "Users",
    detail_aksi: `Membuat user baru: ${data.name} (${data.email})`,
    data_sebelum: null,
    data_sesudah: { id, ...data, password: "[HIDDEN]" },
  });

  return id;
}

/**
 * Update user
 */
export async function updateUser(
  id: string,
  data: UserUpdateInput,
  actorId: string | null = null
): Promise<void> {
  // Get existing data for logging
  const existingUser = await getUserById(id);
  if (!existingUser) {
    throw new Error("User not found");
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (data.name !== undefined) {
    updates.push("name = ?");
    params.push(data.name);
  }

  if (data.email !== undefined) {
    updates.push("email = ?");
    params.push(data.email);
  }

  if (data.password !== undefined && data.password) {
    updates.push("password = ?");
    const hashedPassword = await bcrypt.hash(data.password, 10);
    params.push(hashedPassword);
  }

  if (data.role !== undefined) {
    updates.push("role = ?");
    params.push(data.role);
  }

  if (data.avatar !== undefined) {
    updates.push("avatar = ?");
    params.push(data.avatar);
  }

  if (data.is_active !== undefined) {
    updates.push("is_active = ?");
    params.push(data.is_active);
  }

  if (updates.length === 0) {
    return;
  }

  updates.push("updated_at = NOW()");
  params.push(id);

  const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
  await execute(sql, params);

  // Log activity
  await createLogWithData({
    user_id: actorId,
    aksi: "Update",
    modul: "Users",
    detail_aksi: `Mengupdate user: ${existingUser.name}`,
    data_sebelum: existingUser,
    data_sesudah: {
      ...existingUser,
      ...data,
      password: data.password ? "[HIDDEN]" : undefined,
    },
  });
}

/**
 * Delete user
 */
export async function deleteUser(
  id: string,
  actorId: string | null = null
): Promise<void> {
  // Get existing data for logging
  const existingUser = await getUserById(id);
  if (!existingUser) {
    throw new Error("User not found");
  }

  const sql = "DELETE FROM users WHERE id = ?";
  await execute(sql, [id]);

  // Log activity
  await createLogWithData({
    user_id: actorId,
    aksi: "Delete",
    modul: "Users",
    detail_aksi: `Menghapus user: ${existingUser.name} (${existingUser.email})`,
    data_sebelum: existingUser,
    data_sesudah: null,
  });
}

/**
 * Toggle user active status
 */
export async function toggleUserActive(
  id: string,
  actorId: string | null = null
): Promise<void> {
  const user = await getUserById(id);
  if (!user) {
    throw new Error("User not found");
  }

  const newStatus = user.is_active === 1 ? 0 : 1;
  const sql = "UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?";
  await execute(sql, [newStatus, id]);

  // Log activity
  await createLogWithData({
    user_id: actorId,
    aksi: "Update",
    modul: "Users",
    detail_aksi: `${newStatus === 1 ? "Mengaktifkan" : "Menonaktifkan"} user: ${
      user.name
    }`,
    data_sebelum: { is_active: user.is_active },
    data_sesudah: { is_active: newStatus },
  });
}

/**
 * Verify user email
 */
export async function verifyUserEmail(
  id: string,
  actorId: string | null = null
): Promise<void> {
  const sql =
    "UPDATE users SET email_verified = 1, updated_at = NOW() WHERE id = ?";
  await execute(sql, [id]);

  const user = await getUserById(id);
  if (user) {
    await createLogWithData({
      user_id: actorId,
      aksi: "Update",
      modul: "Users",
      detail_aksi: `Memverifikasi email user: ${user.name}`,
      data_sebelum: { email_verified: 0 },
      data_sesudah: { email_verified: 1 },
    });
  }
}

/**
 * Update last login
 */
export async function updateLastLogin(id: string): Promise<void> {
  const sql = "UPDATE users SET last_login_at = NOW() WHERE id = ?";
  await execute(sql, [id]);
}

/**
 * Check if email exists
 */
export async function emailExists(
  email: string,
  excludeId?: string
): Promise<boolean> {
  let sql = "SELECT COUNT(*) as count FROM users WHERE email = ?";
  const params: any[] = [email];

  if (excludeId) {
    sql += " AND id != ?";
    params.push(excludeId);
  }

  const result = await queryOne<{ count: number }>(sql, params);
  return (result?.count || 0) > 0;
}
