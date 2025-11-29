"use client";

import { useState, useEffect } from "react";
import { Kategori } from "@/lib/types";
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface KategoriModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kategori: Kategori | null;
  onSuccess: () => void;
}

export default function KategoriModal({
  open,
  onOpenChange,
  kategori,
  onSuccess,
}: KategoriModalProps) {
  const [nama, setNama] = useState("");
  const [slug, setSlug] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = !!kategori;

  // Load kategori data when editing
  useEffect(() => {
    if (kategori) {
      setNama(kategori.nama);
      setSlug(kategori.slug);
      setDeskripsi(kategori.deskripsi || "");
      setIcon(kategori.icon || "");
      setColor(kategori.color || "");
    } else {
      // Reset form
      setNama("");
      setSlug("");
      setDeskripsi("");
      setIcon("");
      setColor("#3b82f6");
    }
    setError("");
  }, [kategori, open]);

  // Auto-generate slug from nama
  const handleNamaChange = (value: string) => {
    setNama(value);
    if (!isEdit) {
      // Only auto-generate slug when creating new
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setSlug(autoSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        nama,
        slug,
        deskripsi,
        icon,
        color,
      };

      const url = isEdit ? `/api/kategori/${kategori.id}` : "/api/kategori";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Terjadi kesalahan");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Kategori" : "Tambah Kategori Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update informasi kategori"
              : "Buat kategori baru untuk mengorganisir berita"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Nama */}
            <div className="space-y-2">
              <Label htmlFor="nama">
                Nama Kategori <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nama"
                value={nama}
                onChange={(e) => handleNamaChange(e.target.value)}
                placeholder="Contoh: Pemerintahan"
                required
                maxLength={255}
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug <span className="text-red-500">*</span>
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="pemerintahan"
                required
                maxLength={255}
                pattern="[a-z0-9-]+"
                title="Hanya huruf kecil, angka, dan dash (-)"
              />
              <p className="text-xs text-gray-500">
                URL-friendly identifier (huruf kecil, angka, dan dash)
              </p>
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Deskripsi singkat kategori..."
                rows={3}
              />
            </div>

            {/* Icon & Color */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (Emoji)</Label>
                <Input
                  id="icon"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="🏛️"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500">Emoji atau icon name</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Warna</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#3b82f6"
                    pattern="^#[0-9a-fA-F]{6}$"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-3">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center text-white text-xl"
                    style={{ backgroundColor: color }}>
                    {icon || "📁"}
                  </div>
                  <div>
                    <div className="font-medium">{nama || "Nama Kategori"}</div>
                    <div className="text-sm text-gray-500">
                      {slug || "slug-kategori"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
