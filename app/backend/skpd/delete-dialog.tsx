// app/backend/skpd/delete-skpd-dialog.tsx

"use client";

import { useState } from "react";
import { SKPD } from "@/lib/types";
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
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface DeleteSKPDDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skpd: SKPD | null;
  onSuccess: () => void;
}

export default function DeleteSKPDDialog({
  open,
  onOpenChange,
  skpd,
  onSuccess,
}: DeleteSKPDDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!skpd) return;

    setIsLoading(true);

    try {
      const res = await fetch(`/api/backend/skpd/${skpd.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("SKPD berhasil dihapus");
        onSuccess();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal menghapus SKPD");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Terjadi kesalahan saat menghapus");
    } finally {
      setIsLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Hapus SKPD?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Apakah Anda yakin ingin menghapus SKPD{" "}
              <strong className="text-gray-900 dark:text-white">
                {skpd?.nama}
              </strong>
              ?
            </p>
            <p className="text-red-600 font-medium">
              Tindakan ini tidak dapat dibatalkan!
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              "Hapus SKPD"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
