"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tag } from "@/lib/types";

interface TagFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tag: Tag | null;
}

export function TagFormDialog({
  open,
  onClose,
  onSuccess,
  tag,
}: TagFormDialogProps) {
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ nama?: string }>({});

  const isEdit = !!tag;

  useEffect(() => {
    if (open) {
      if (tag) {
        setNama(tag.nama);
      } else {
        setNama("");
      }
      setErrors({});
    }
  }, [open, tag]);

  const validate = () => {
    const newErrors: { nama?: string } = {};

    if (!nama.trim()) {
      newErrors.nama = "Nama tag harus diisi";
    } else if (nama.length > 255) {
      newErrors.nama = "Nama tag maksimal 255 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const url = isEdit ? `/api/backend/tags/${tag.id}` : "/api/backend/tags";

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: nama.trim(),
        }),
      });

      if (res.ok) {
        toast.success(
          isEdit ? "Tag berhasil diperbarui" : "Tag berhasil dibuat"
        );
        onSuccess();
      } else {
        const data = await res.json();
        toast.error(data.error || "Terjadi kesalahan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Tag" : "Tambah Tag Baru"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Ubah informasi tag" : "Buat tag baru untuk berita"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Tag */}
          <div className="space-y-2">
            <Label htmlFor="nama">
              Nama Tag <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nama"
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Politik, Ekonomi, Olahraga"
              maxLength={255}
              disabled={loading}
            />
            {errors.nama && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.nama}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Slug akan dibuat otomatis dari nama tag
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : isEdit ? "Perbarui" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
