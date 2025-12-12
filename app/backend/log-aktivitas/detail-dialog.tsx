"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogAktivitas } from "@/lib/types";
// HAPUS: import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer-continued";
import { useTheme } from "next-themes";

interface LogDetailDialogProps {
  log: LogAktivitas | null;
  open: boolean;
  onClose: () => void;
}

export function LogDetailDialog({ log, open, onClose }: LogDetailDialogProps) {
  const { theme } = useTheme();

  if (!log) return null;

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
      timeStyle: "medium",
    }).format(d);
  };

  const isDataLoaded =
    log.data_sebelum !== undefined || log.data_sesudah !== undefined;
  const hasJsonData = log.data_sebelum || log.data_sesudah;

  const oldCode = log.data_sebelum
    ? typeof log.data_sebelum === "string"
      ? log.data_sebelum
      : JSON.stringify(log.data_sebelum, null, 2)
    : "";

  const newCode = log.data_sesudah
    ? typeof log.data_sesudah === "string"
      ? log.data_sesudah
      : JSON.stringify(log.data_sesudah, null, 2)
    : "";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* PERBAIKAN LAYOUT:
        1. h-[90vh]: Paksa tinggi dialog 90% dari layar.
        2. flex flex-col: Agar header tetap di atas dan konten di bawahnya mengisi sisa ruang.
      */}
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        {/* Header Tetap (Tidak ikut scroll) */}
        <DialogHeader className="p-6 border-b">
          <DialogTitle>Detail Log Aktivitas</DialogTitle>
        </DialogHeader>

        {/* Area Konten Scrollable (Gunakan div biasa pengganti ScrollArea)
          - flex-1: Mengambil sisa tinggi yang tersedia.
          - overflow-y-auto: Scroll vertikal jika konten panjang.
          - p-6: Padding agar konten tidak mepet pinggir.
        */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Informasi Dasar */}
            <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 bg-muted/30">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Waktu
                </p>
                <p className="font-medium">{formatDate(log.created_at)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pengguna
                </p>
                <p className="font-medium">
                  {log.user_name || "System/Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  IP Address
                </p>
                <code className="text-sm">{log.ip_address || "-"}</code>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Endpoint
                </p>
                <code className="text-sm bg-muted px-1 py-0.5 rounded">
                  {log.method || "GET"} {log.endpoint || "-"}
                </code>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Detail Aksi
              </p>
              <div className="rounded-md bg-muted/50 p-3 text-sm">
                {log.detail_aksi}
              </div>
            </div>

            {/* Diff Viewer */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Perubahan Data
              </p>

              {!isDataLoaded ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground border rounded-md border-dashed">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memuat data lengkap...
                </div>
              ) : !hasJsonData ? (
                <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground text-center border border-dashed">
                  Tidak ada data JSON yang tersimpan.
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden text-xs">
                  <ReactDiffViewer
                    oldValue={oldCode}
                    newValue={newCode}
                    splitView={true}
                    compareMethod={DiffMethod.JSON}
                    useDarkTheme={theme === "dark"}
                    leftTitle="Data Sebelum"
                    rightTitle="Data Sesudah"
                    styles={{
                      variables: {
                        dark: {
                          diffViewerBackground: "#1e293b",
                          diffViewerTitleBackground: "#0f172a",
                          diffViewerColor: "#e2e8f0",
                        },
                        light: {
                          diffViewerBackground: "#ffffff",
                          diffViewerTitleBackground: "#f8fafc",
                          diffViewerColor: "#334155",
                        },
                      },
                      lineNumber: { fontSize: "0.75rem" },
                      contentText: {
                        fontSize: "0.75rem",
                        lineHeight: "1.5",
                        fontFamily: "monospace",
                      },
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
