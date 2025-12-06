import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { AppSettings, AppSettings as AppSettingsType } from "@/lib/types";
import { getAppSettings, updateAppSettings } from "@/lib/models/settings.model";
import { createLogWithData } from "@/lib/models/log.model";

function getRequestMeta(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || undefined;
  const ua = request.headers.get("user-agent") || undefined;

  return {
    ip_address: ip || null,
    user_agent: ua || null,
    endpoint: request.nextUrl.pathname,
    method: request.method,
  };
}

const numberFields: (keyof AppSettingsType)[] = [
  "tahun",
  "max_upload_size",
  "smtp_port",
  "session_timeout",
  "password_min_length",
  "max_login_attempts",
  "lockout_duration",
  "backup_interval",
  "log_retention_days",
];

const booleanFields: (keyof AppSettingsType)[] = [
  "enable_2fa",
  "backup_auto",
  "log_activity",
];

const selectableFields: (keyof AppSettingsType)[] = ["mode"];

const allowedFields: (keyof AppSettings)[] = [
  "nama_aplikasi",
  "alias_aplikasi",
  "deskripsi",
  "versi",
  "copyright",
  "tahun",
  "logo",
  "favicon",
  "email",
  "no_telepon",
  "whatsapp",
  "alamat",
  "domain",
  "mode",
  "maintenance_message",
  "timezone",
  "bahasa_default",
  "database_version",
  "max_upload_size",
  "allowed_extensions",
  "meta_keywords",
  "meta_description",
  "og_image",
  "facebook_url",
  "instagram_url",
  "twitter_url",
  "youtube_url",
  "tiktok_url",
  "smtp_host",
  "smtp_port",
  "smtp_user",
  "smtp_from_name",
  "notifikasi_email",
  "session_timeout",
  "password_min_length",
  "max_login_attempts",
  "lockout_duration",
  "enable_2fa",
  "theme_color",
  "date_format",
  "time_format",
  "instansi_nama",
  "kepala_dinas",
  "nip_kepala_dinas",
  "pimpinan_wilayah",
  "logo_pemda",
  "backup_auto",
  "backup_interval",
  "last_backup",
  "log_activity",
  "log_retention_days",
];

function normalizePayload(body: any): Partial<AppSettings> {
  const payload: any = {};

  for (const field of allowedFields) {
    if (body[field] === undefined) continue;

    if (numberFields.includes(field as keyof AppSettingsType)) {
      const value = Number(body[field]);
      if (!Number.isNaN(value)) payload[field] = value;
      continue;
    }

    if (booleanFields.includes(field as keyof AppSettingsType)) {
      payload[field] = body[field] ? 1 : 0;
      continue;
    }

    if (selectableFields.includes(field as keyof AppSettingsType)) {
      const allowedValues = ["online", "offline", "maintenance"];
      if (allowedValues.includes(body[field])) {
        payload[field] = body[field];
      }
      continue;
    }

    if (field === "allowed_extensions") {
      if (Array.isArray(body[field])) {
        payload[field] = body[field];
      } else if (typeof body[field] === "string") {
        const parts = body[field]
          .split(",")
          .map((p: string) => p.trim())
          .filter(Boolean);
        payload[field] = parts;
      }
      continue;
    }

    payload[field] = body[field];
  }

  return payload;
}

export async function GET(_request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getAppSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const before = await getAppSettings();
    if (!before) {
      return NextResponse.json(
        { error: "Pengaturan tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const payload = normalizePayload(body);

    if (Object.keys(payload).length === 0) {
      return NextResponse.json(
        { error: "Tidak ada perubahan yang dikirim" },
        { status: 400 }
      );
    }

    await updateAppSettings(payload, session.user.id);

    const after = await getAppSettings();

    await createLogWithData({
      user_id: session.user.id,
      aksi: "Update",
      modul: "Pengaturan",
      detail_aksi: "Memperbarui pengaturan aplikasi",
      data_sebelum: before,
      data_sesudah: after,
      ...getRequestMeta(request),
    });

    return NextResponse.json({
      message: "Pengaturan diperbarui",
      settings: after,
    });
  } catch (error) {
    console.error("Error updating settings", error);
    return NextResponse.json(
      { error: "Gagal memperbarui pengaturan" },
      { status: 500 }
    );
  }
}
