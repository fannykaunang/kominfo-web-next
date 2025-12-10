// lib/models/settings.model.ts

import { execute, queryOne } from "@/lib/db-helpers";
import { AppSettings } from "@/lib/types";
import { createLog } from "@/lib/models/log.model";

export type AppSettingsUpdateInput = Partial<
  Omit<AppSettings, "id" | "created_at" | "updated_at">
>;

export async function getAppSettings(): Promise<AppSettings | null> {
  return queryOne<AppSettings>(
    "SELECT * FROM app_settings WHERE id = 1 LIMIT 1"
  );
}

export function shouldRunBackup(settings: AppSettings): boolean {
  if (!settings.backup_auto) return false;

  if (!settings.last_backup) return true;

  const now = new Date();
  const lastBackup = new Date(settings.last_backup);
  const diffTime = now.getTime() - lastBackup.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays >= settings.backup_interval;
}

export async function markBackupExecuted(userId?: string | null) {
  await execute(
    "UPDATE app_settings SET last_backup = NOW(), updated_by = ? WHERE id = 1",
    [userId || null]
  );
}

export async function updateAppSettings(
  data: AppSettingsUpdateInput,
  userId?: string | null
) {
  const fields: string[] = [];
  const params: any[] = [];

  const allowedExtensions = data.allowed_extensions;
  if (allowedExtensions !== undefined) {
    const value = Array.isArray(allowedExtensions)
      ? JSON.stringify(allowedExtensions)
      : allowedExtensions;
    fields.push("allowed_extensions = ?");
    params.push(value);
  }

  for (const [key, value] of Object.entries(data)) {
    if (key === "allowed_extensions") continue;
    fields.push(`${key} = ?`);
    params.push(value);
  }

  if (userId !== undefined) {
    fields.push("updated_by = ?");
    params.push(userId);
  }

  if (fields.length === 0) return;

  const sql = `UPDATE app_settings SET ${fields.join(", ")} WHERE id = 1`;
  await execute(sql, params);
}

export async function runAutoBackupCycle(options?: {
  userId?: string | null;
  force?: boolean;
  endpoint?: string;
  method?: string;
}): Promise<{
  executed: boolean;
  message: string;
  settings?: AppSettings | null;
}> {
  const settings = await getAppSettings();

  if (!settings) {
    return { executed: false, message: "Pengaturan tidak ditemukan" };
  }

  const eligible = options?.force ? true : shouldRunBackup(settings);

  if (!eligible) {
    return {
      executed: false,
      message: "Backup belum perlu dijalankan",
      settings,
    };
  }

  await markBackupExecuted(options?.userId || null);

  await createLog({
    user_id: options?.userId || null,
    aksi: "Backup",
    modul: "Pengaturan",
    detail_aksi: "Backup otomatis dijalankan",
    endpoint: options?.endpoint || "auto-backup",
    method: options?.method || "SYSTEM",
  });

  const updatedSettings = await getAppSettings();

  return {
    executed: true,
    message: "Backup berhasil dicatat",
    settings: updatedSettings,
  };
}
