"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Calendar,
  Monitor,
  Activity,
  MapPin,
  Globe,
  Code,
  FileJson,
} from "lucide-react";

interface LogAktivitas {
  id: string;
  user_id: string;
  user_name: string;
  aksi: string;
  modul: string;
  detail_aksi: string;
  endpoint?: string;
  ip_address?: string;
  user_agent?: string;
  data_sebelum?: any;
  data_sesudah?: any;
  created_at: string;
}

interface LogDetailDialogProps {
  log: LogAktivitas | null;
  open: boolean;
  onClose: () => void;
}

export function LogDetailDialog({ log, open, onClose }: LogDetailDialogProps) {
  if (!log) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  const getActionBadgeColor = (aksi: string) => {
    const lowerAksi = aksi.toLowerCase();
    if (lowerAksi.includes("create") || lowerAksi.includes("login")) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    } else if (lowerAksi.includes("update") || lowerAksi.includes("edit")) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    } else if (
      lowerAksi.includes("delete") ||
      lowerAksi.includes("hapus") ||
      lowerAksi.includes("logout")
    ) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  const extractMethod = (endpoint?: string) => {
    if (!endpoint) return null;
    const match = endpoint.match(/^(GET|POST|PUT|PATCH|DELETE)/i);
    return match ? match[1] : null;
  };

  const extractPath = (endpoint?: string) => {
    if (!endpoint) return "";
    const cleaned = endpoint.replace(/^(GET|POST|PUT|PATCH|DELETE)\s+/i, "");
    return cleaned;
  };

  const getMethodBadgeColor = (method?: string) => {
    if (!method) return "bg-gray-100 text-gray-800";

    switch (method.toUpperCase()) {
      case "POST":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "GET":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "PUT":
      case "PATCH":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const method = extractMethod(log.endpoint);
  const path = extractPath(log.endpoint);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Activity className="h-6 w-6 text-blue-600" />
            Detail Log Aktivitas
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap tentang aktivitas pengguna
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Info */}
          <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-950 dark:to-indigo-950">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {log.user_name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  User ID: {log.user_id}
                </p>
              </div>
            </div>
          </div>

          {/* Action & Module */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Activity className="h-4 w-4" />
                Aksi
              </label>
              <span
                className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${getActionBadgeColor(
                  log.aksi
                )}`}
              >
                {log.aksi}
              </span>
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Monitor className="h-4 w-4" />
                Modul
              </label>
              <span className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-900 dark:bg-gray-800 dark:text-white">
                {log.modul}
              </span>
            </div>
          </div>

          {/* Detail Aksi */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <FileJson className="h-4 w-4" />
              Detail Aksi
            </label>
            <div className="rounded-lg border bg-gray-50 p-3 dark:bg-gray-900">
              <p className="text-sm text-gray-900 dark:text-white">
                {log.detail_aksi}
              </p>
            </div>
          </div>

          {/* Timestamp */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Calendar className="h-4 w-4" />
              Waktu
            </label>
            <div className="rounded-lg border bg-gray-50 p-3 dark:bg-gray-900">
              <p className="text-sm font-mono text-gray-900 dark:text-white">
                {formatDate(log.created_at)}
              </p>
            </div>
          </div>

          {/* Endpoint */}
          {log.endpoint && (
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Code className="h-4 w-4" />
                Endpoint
              </label>
              <div className="rounded-lg border bg-gray-50 p-3 dark:bg-gray-900">
                <div className="flex items-center gap-2">
                  {method && (
                    <span
                      className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${getMethodBadgeColor(
                        method
                      )}`}
                    >
                      {method}
                    </span>
                  )}
                  <code className="text-sm text-gray-900 dark:text-white">
                    {path}
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* IP & Location */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Globe className="h-4 w-4" />
                IP Address
              </label>
              <code className="block rounded-lg border bg-gray-50 p-3 text-sm text-gray-900 dark:bg-gray-900 dark:text-white">
                {log.ip_address || "-"}
              </code>
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <MapPin className="h-4 w-4" />
                User Agent
              </label>
              <div className="rounded-lg border bg-gray-50 p-3 dark:bg-gray-900">
                <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
                  {log.user_agent || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Data Before (if exists) */}
          {log.data_sebelum && Object.keys(log.data_sebelum).length > 0 && (
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FileJson className="h-4 w-4" />
                Data Sebelum Perubahan
              </label>
              <div className="rounded-lg border bg-red-50 dark:bg-red-950/20">
                <pre className="overflow-x-auto p-3 text-xs text-gray-900 dark:text-white">
                  {JSON.stringify(log.data_sebelum, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Data After (if exists) */}
          {log.data_sesudah && Object.keys(log.data_sesudah).length > 0 && (
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FileJson className="h-4 w-4" />
                Data Sesudah Perubahan
              </label>
              <div className="rounded-lg border bg-green-50 dark:bg-green-950/20">
                <pre className="overflow-x-auto p-3 text-xs text-gray-900 dark:text-white">
                  {JSON.stringify(log.data_sesudah, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Log ID */}
          <div className="border-t pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Log ID: <code className="font-mono">{log.id}</code>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
