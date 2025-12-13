// app/backend/newsletter/form-dialog.tsx

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Newsletter } from "@/lib/types";

interface NewsletterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void; // Diubah dari onClose agar sesuai dengan pola Radix UI/Shadcn
  onSuccess: () => void;
  initialData: Newsletter | null; // Diubah dari 'newsletter' agar konsisten dengan _client.tsx
}

export function NewsletterFormDialog({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: NewsletterFormDialogProps) {
  const [email, setEmail] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [loading, setLoading] = useState(false);

  const isEdit = !!initialData;

  useEffect(() => {
    if (open) {
      if (initialData) {
        setEmail(initialData.email);
        setIsActive(initialData.is_active === 1);
      } else {
        setEmail("");
        setIsActive(true);
      }
      setErrors({});
    }
  }, [open, initialData]);

  const validate = () => {
    const newErrors: { email?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email harus diisi";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim())) {
      newErrors.email = "Format email tidak valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      // Sesuaikan URL dan Method berdasarkan mode Edit/Create
      const url = isEdit
        ? `/api/newsletter/${initialData?.id}`
        : "/api/newsletter";

      // Gunakan PATCH atau PUT tergantung implementasi API Anda untuk update
      // Biasanya update partial menggunakan PATCH, full update PUT.
      // Di sini saya gunakan PATCH agar lebih aman jika API mendukungnya, atau PUT jika standard Anda PUT.
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          is_active: isActive ? 1 : 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Terjadi kesalahan");
      }

      toast.success(
        isEdit
          ? "Newsletter berhasil diperbarui"
          : "Newsletter berhasil ditambahkan"
      );
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Newsletter" : "Tambah Newsletter Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi newsletter"
              : "Tambah email baru ke daftar newsletter"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contoh@email.com"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.email}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Status Aktif
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sesuaikan apakah email menerima newsletter
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
