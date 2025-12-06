"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Upload, Loader2, Save, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface FieldConfig {
  key: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "file"
    | "select"
    | "color"
    | "switch"
    | "datetime";
  description?: string;
  options?: { label: string; value: string }[];
  colSpan?: number;
}

interface SectionConfig {
  title: string;
  description?: string;
  fields: FieldConfig[];
}

interface TabConfig {
  key: string;
  label: string;
  description?: string;
  sections: SectionConfig[];
}

const tabs: TabConfig[] = [
  {
    key: "umum",
    label: "Umum",
    description: "Profil aplikasi dan preferensi dasar.",
    sections: [
      {
        title: "Informasi Umum",
        fields: [
          { key: "nama_aplikasi", label: "Nama Aplikasi", type: "text" },
          { key: "alias_aplikasi", label: "Alias Aplikasi", type: "text" },
          {
            key: "deskripsi",
            label: "Deskripsi",
            type: "textarea",
            colSpan: 2,
          },
          { key: "versi", label: "Versi", type: "text" },
          { key: "tahun", label: "Tahun", type: "number" },
          { key: "copyright", label: "Copyright", type: "text", colSpan: 2 },
          {
            key: "mode",
            label: "Mode Aplikasi",
            type: "select",
            options: [
              { value: "online", label: "Online" },
              { value: "offline", label: "Offline" },
              { value: "maintenance", label: "Maintenance" },
            ],
          },
          {
            key: "maintenance_message",
            label: "Pesan Maintenance",
            type: "textarea",
            colSpan: 2,
          },
        ],
      },
      {
        title: "Waktu & Lokal",
        fields: [
          { key: "timezone", label: "Zona Waktu", type: "text" },
          { key: "bahasa_default", label: "Bahasa Default", type: "text" },
          { key: "date_format", label: "Format Tanggal", type: "text" },
          { key: "time_format", label: "Format Waktu", type: "text" },
          { key: "theme_color", label: "Warna Tema", type: "color" },
        ],
      },
    ],
  },
  {
    key: "kontak",
    label: "Kontak",
    description: "Informasi kontak dan media sosial.",
    sections: [
      {
        title: "Informasi Kontak",
        fields: [
          { key: "email", label: "Email", type: "text" },
          { key: "no_telepon", label: "No. Telepon", type: "text" },
          { key: "whatsapp", label: "WhatsApp", type: "text" },
          { key: "domain", label: "Domain", type: "text" },
          { key: "alamat", label: "Alamat", type: "textarea", colSpan: 2 },
        ],
      },
      {
        title: "Media Sosial",
        description: "Tautan media sosial resmi.",
        fields: [
          { key: "facebook_url", label: "Facebook URL", type: "text" },
          { key: "instagram_url", label: "Instagram URL", type: "text" },
          { key: "twitter_url", label: "Twitter URL", type: "text" },
          { key: "youtube_url", label: "YouTube URL", type: "text" },
          { key: "tiktok_url", label: "TikTok URL", type: "text" },
        ],
      },
    ],
  },
  {
    key: "email",
    label: "Email",
    description: "Pengaturan SMTP dan notifikasi.",
    sections: [
      {
        title: "Konfigurasi Email",
        fields: [
          { key: "smtp_host", label: "SMTP Host", type: "text" },
          { key: "smtp_port", label: "SMTP Port", type: "number" },
          { key: "smtp_user", label: "SMTP User", type: "text" },
          { key: "smtp_from_name", label: "Nama Pengirim", type: "text" },
          {
            key: "notifikasi_email",
            label: "Email Notifikasi",
            type: "text",
            colSpan: 2,
          },
        ],
      },
    ],
  },
  {
    key: "tampilan",
    label: "Tampilan",
    description: "Logo, ikon, dan metadata tampilan.",
    sections: [
      {
        title: "Identitas Visual",
        fields: [
          { key: "logo", label: "Logo", type: "file" },
          { key: "logo_pemda", label: "Logo Pemda", type: "file" },
          { key: "favicon", label: "Icon", type: "file" },
          { key: "og_image", label: "Gambar OG", type: "text", colSpan: 2 },
        ],
      },
      {
        title: "SEO",
        fields: [
          {
            key: "meta_keywords",
            label: "Meta Keywords",
            type: "textarea",
            colSpan: 2,
          },
          {
            key: "meta_description",
            label: "Meta Description",
            type: "textarea",
            colSpan: 2,
          },
        ],
      },
    ],
  },
  {
    key: "organisasi",
    label: "Organisasi",
    description: "Detail instansi dan pimpinan.",
    sections: [
      {
        title: "Identitas Organisasi",
        fields: [
          { key: "instansi_nama", label: "Nama Instansi", type: "text" },
          { key: "kepala_dinas", label: "Kepala Dinas", type: "text" },
          { key: "nip_kepala_dinas", label: "NIP Kepala Dinas", type: "text" },
          { key: "pimpinan_wilayah", label: "Pimpinan Wilayah", type: "text" },
        ],
      },
    ],
  },
  {
    key: "keamanan",
    label: "Keamanan",
    description: "Kebijakan login dan sesi.",
    sections: [
      {
        title: "Batasan Akses",
        fields: [
          {
            key: "session_timeout",
            label: "Durasi Sesi (menit)",
            type: "number",
          },
          {
            key: "password_min_length",
            label: "Minimal Kata Sandi",
            type: "number",
          },
          {
            key: "max_login_attempts",
            label: "Maks. Percobaan Login",
            type: "number",
          },
          {
            key: "lockout_duration",
            label: "Durasi Blokir (menit)",
            type: "number",
          },
          { key: "enable_2fa", label: "Aktifkan 2FA", type: "switch" },
        ],
      },
    ],
  },
  {
    key: "sistem",
    label: "Sistem",
    description: "Backup, log aktivitas, dan batasan sistem.",
    sections: [
      {
        title: "Backup & Log",
        fields: [
          { key: "backup_auto", label: "Aktifkan Auto Backup", type: "switch" },
          {
            key: "backup_interval",
            label: "Interval Backup (hari)",
            type: "number",
          },
          { key: "last_backup", label: "Terakhir Backup", type: "datetime" },
          { key: "log_activity", label: "Catat Aktivitas", type: "switch" },
          {
            key: "log_retention_days",
            label: "Retensi Log (hari)",
            type: "number",
          },
        ],
      },
      {
        title: "Batasan Sistem",
        fields: [
          { key: "database_version", label: "Versi Database", type: "text" },
          {
            key: "max_upload_size",
            label: "Maks. Ukuran Upload (MB)",
            type: "number",
          },
          {
            key: "allowed_extensions",
            label: "Ekstensi Diizinkan",
            type: "textarea",
            colSpan: 2,
          },
        ],
      },
    ],
  },
];

const allFields = tabs.flatMap((tab) =>
  tab.sections.flatMap((section) => section.fields)
);

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? "umum");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});

  const numberFields = useMemo(
    () =>
      new Set(allFields.filter((f) => f.type === "number").map((f) => f.key)),
    []
  );

  const switchFields = useMemo(
    () =>
      new Set(allFields.filter((f) => f.type === "switch").map((f) => f.key)),
    []
  );

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings");
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Gagal memuat pengaturan");

      setValues({
        ...data,
        enable_2fa: data.enable_2fa === 1,
        backup_auto: data.backup_auto === 1,
        log_activity: data.log_activity === 1,
        allowed_extensions: Array.isArray(data.allowed_extensions)
          ? data.allowed_extensions.join(", ")
          : (() => {
              try {
                const parsed = JSON.parse(data.allowed_extensions || "[]");
                return Array.isArray(parsed) ? parsed.join(", ") : "";
              } catch (error) {
                return data.allowed_extensions || "";
              }
            })(),
      });
    } catch (error: any) {
      toast.error(error.message || "Gagal memuat pengaturan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (
    key: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingField(key);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "settings");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal mengupload file");

      handleChange(key, data.url);
      toast.success("File berhasil diupload");
    } catch (error: any) {
      toast.error(error.message || "Gagal mengupload file");
    } finally {
      setUploadingField(null);
      event.target.value = "";
    }
  };

  const parseAllowedExtensions = (value: string) =>
    (value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload: Record<string, any> = {};

      for (const field of allFields) {
        if (values[field.key] === undefined) continue;

        if (field.type === "datetime") continue;

        if (switchFields.has(field.key)) {
          payload[field.key] = values[field.key] ? 1 : 0;
          continue;
        }

        if (field.key === "allowed_extensions") {
          payload.allowed_extensions = parseAllowedExtensions(
            values[field.key]
          );
          continue;
        }

        if (numberFields.has(field.key)) {
          const numericValue = Number(values[field.key]);
          payload[field.key] = Number.isNaN(numericValue)
            ? values[field.key]
            : numericValue;
          continue;
        }

        payload[field.key] = values[field.key];
      }

      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Gagal menyimpan pengaturan");

      toast.success("Pengaturan berhasil disimpan");
      if (data.settings) setValues({ ...values, ...data.settings });
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  const handleRunBackup = async () => {
    setBackupLoading(true);
    try {
      const response = await fetch("/api/settings/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Gagal menjalankan backup");

      toast.success(data.message || "Backup dijalankan");
      if (data.settings) setValues((prev) => ({ ...prev, ...data.settings }));
    } catch (error: any) {
      toast.error(error.message || "Backup gagal dijalankan");
    } finally {
      setBackupLoading(false);
    }
  };

  const renderField = (field: FieldConfig) => {
    const value = values[field.key] ?? "";

    if (field.type === "textarea") {
      return (
        <Textarea
          id={field.key}
          value={value}
          onChange={(e) => handleChange(field.key, e.target.value)}
          placeholder={field.label}
          className="min-h-32"
        />
      );
    }

    if (field.type === "number") {
      return (
        <Input
          id={field.key}
          type="number"
          value={value}
          onChange={(e) => handleChange(field.key, e.target.value)}
        />
      );
    }

    if (field.type === "select" && field.options) {
      return (
        <Select
          value={value || field.options[0]?.value || ""}
          onValueChange={(val) => handleChange(field.key, val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih" />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === "color") {
      return (
        <div className="flex items-center gap-3">
          <Input
            id={field.key}
            type="color"
            value={value || "#3b82f6"}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="h-10 w-20"
          />
          <Input
            type="text"
            value={value || "#3b82f6"}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="flex-1"
          />
        </div>
      );
    }

    if (field.type === "file") {
      return (
        <div className="space-y-2">
          {value && (
            <div className="text-sm text-muted-foreground break-all">
              File saat ini: {value}
            </div>
          )}
          <Label
            htmlFor={`${field.key}-file`}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-3 py-4 text-sm hover:bg-muted"
          >
            {uploadingField === field.key ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>
              {uploadingField === field.key ? "Uploading..." : "Upload file"}
            </span>
          </Label>
          <Input
            id={`${field.key}-file`}
            type="file"
            className="hidden"
            onChange={(e) => handleFileUpload(field.key, e)}
          />
        </div>
      );
    }

    if (field.type === "switch") {
      return (
        <div className="flex items-center gap-3">
          <Switch
            id={field.key}
            checked={Boolean(value)}
            onCheckedChange={(checked) => handleChange(field.key, checked)}
          />
          <span className="text-sm text-muted-foreground">{field.label}</span>
        </div>
      );
    }

    if (field.type === "datetime") {
      return (
        <Input
          id={field.key}
          type="text"
          value={
            value ? new Date(value).toLocaleString() : "Belum pernah backup"
          }
          disabled
        />
      );
    }

    return (
      <Input
        id={field.key}
        value={value}
        onChange={(e) => handleChange(field.key, e.target.value)}
        placeholder={field.label}
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Pengaturan Aplikasi
          </h1>
          <Badge variant="outline">Single row only</Badge>
        </div>
        <p className="text-muted-foreground">
          Seluruh pengaturan tersimpan pada satu baris tabel{" "}
          <strong>app_settings</strong>.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-xl">Form Pengaturan</CardTitle>
            <p className="text-sm text-muted-foreground">
              Setiap tab mengelompokkan field yang saling berkaitan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={fetchSettings}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" /> Muat ulang
                </>
              )}
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Simpan Pengaturan
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto">
              <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val)}
                className="w-full"
              >
                <TabsList className="flex min-w-max gap-2 overflow-x-auto">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.key}
                      value={tab.key}
                      className="capitalize"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {tabs.map((tab) => (
                  <TabsContent
                    key={tab.key}
                    value={tab.key}
                    className="mt-4 space-y-4"
                  >
                    {tab.description && (
                      <p className="text-sm text-muted-foreground">
                        {tab.description}
                      </p>
                    )}

                    {tab.sections.map((section) => (
                      <div
                        key={`${tab.key}-${section.title}`}
                        className="space-y-3 rounded-lg border p-4"
                      >
                        <div className="space-y-1">
                          <p className="text-base font-semibold">
                            {section.title}
                          </p>
                          {section.description && (
                            <p className="text-sm text-muted-foreground">
                              {section.description}
                            </p>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {section.fields.map((field) => (
                            <div
                              key={field.key}
                              className={`space-y-2 ${
                                field.colSpan === 2 ? "md:col-span-2" : ""
                              }`}
                            >
                              <Label htmlFor={field.key}>{field.label}</Label>
                              {renderField(field)}
                              {field.description && (
                                <p className="text-xs text-muted-foreground">
                                  {field.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {tab.key === "sistem" && (
                      <div className="rounded-lg border bg-muted/50 p-4">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">Auto Backup</p>
                            <p className="text-sm text-muted-foreground">
                              Menggunakan field <strong>backup_auto</strong>,{" "}
                              <strong>backup_interval</strong>, dan
                              <strong> last_backup</strong> untuk penjadwalan
                              otomatis.
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Backup terakhir:{" "}
                              {values.last_backup
                                ? new Date(values.last_backup).toLocaleString()
                                : "Belum pernah"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={fetchSettings}
                              disabled={loading || backupLoading}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" /> Segarkan
                              Data
                            </Button>
                            <Button
                              onClick={handleRunBackup}
                              disabled={backupLoading}
                            >
                              {backupLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                  Menjalankan...
                                </>
                              ) : (
                                <>
                                  <Upload className="mr-2 h-4 w-4" /> Jalankan
                                  Backup
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
