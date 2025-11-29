"use client";

import { useState } from "react";
import { Berita } from "@/lib/types";
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

interface DeleteBeritaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  berita: Berita | null;
  onSuccess: () => void;
}

export default function DeleteBeritaDialog({
  open,
  onOpenChange,
  berita,
  onSuccess,
}: DeleteBeritaDialogProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!berita) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/berita/${berita.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus berita");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!berita) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Hapus Berita?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Anda akan menghapus berita: <strong>{berita.judul}</strong>
            </p>
            <p className="text-red-600 font-medium">
              Tindakan ini tidak dapat dibatalkan!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
