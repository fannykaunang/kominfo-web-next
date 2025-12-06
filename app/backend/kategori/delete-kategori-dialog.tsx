// app/backend/kategori/delete-kategori-dialog.tsx

"use client";

import { useEffect, useState } from "react";
import { Kategori } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteKategoriDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kategori: Kategori | null;
  onSuccess: () => void;
}

export default function DeleteKategoriDialog({
  open,
  onOpenChange,
  kategori,
  onSuccess,
}: DeleteKategoriDialogProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setLoading(false);
      setError("");
    }
  }, [open]);

  const handleDelete = async () => {
    if (!kategori) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/kategori/${kategori.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus kategori");
      }

      // Beritahu parent buat refresh data / reload table
      onSuccess();

      // Tutup dialog
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Gagal menghapus kategori");
    } finally {
      setLoading(false);
    }
  };

  if (!kategori) return null;

  const hasBerita = (kategori.berita_count || 0) > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Hapus Kategori?
          </AlertDialogTitle>

          {/* wrapper untuk spacing, bukan AlertDialogDescription */}
          <div className="space-y-2">
            <AlertDialogDescription>
              Anda akan menghapus kategori: <strong>{kategori.nama}</strong>
            </AlertDialogDescription>

            {hasBerita && (
              <Alert variant="destructive">
                <AlertDescription>
                  Kategori ini sedang digunakan oleh{" "}
                  <strong>{kategori.berita_count} berita</strong>. Anda tidak
                  dapat menghapus kategori yang masih digunakan.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading || hasBerita}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
