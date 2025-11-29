"use client";

import { useState, useEffect } from "react";
import { Berita, Kategori } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface BeritaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  berita: Berita | null;
  kategoriList: Kategori[];
  onSuccess: () => void;
}

export default function BeritaModal({
  open,
  onOpenChange,
  berita,
  kategoriList,
  onSuccess,
}: BeritaModalProps) {
  const [judul, setJudul] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [konten, setKonten] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [isHighlight, setIsHighlight] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [publishedAt, setPublishedAt] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEdit = !!berita;

  // Load berita data when editing
  useEffect(() => {
    if (berita) {
      setJudul(berita.judul);
      setSlug(berita.slug);
      setExcerpt(berita.excerpt);
      setKonten(berita.konten);
      setFeaturedImage(berita.featured_image || "");
      setKategoriId(berita.kategori_id);
      setIsHighlight(!!berita.is_highlight);
      setIsPublished(!!berita.is_published);
      setPublishedAt(
        berita.published_at
          ? new Date(berita.published_at).toISOString().split("T")[0]
          : ""
      );
    } else {
      // Reset form
      setJudul("");
      setSlug("");
      setExcerpt("");
      setKonten("");
      setFeaturedImage("");
      setKategoriId("");
      setIsHighlight(false);
      setIsPublished(false);
      setPublishedAt("");
    }
    setError("");
  }, [berita, open]);

  // Auto-generate slug from judul
  const handleJudulChange = (value: string) => {
    setJudul(value);
    if (!isEdit) {
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
        judul,
        slug,
        excerpt,
        konten,
        featured_image: featuredImage || undefined,
        kategori_id: kategoriId,
        is_highlight: isHighlight,
        is_published: isPublished,
        published_at: publishedAt || undefined,
      };

      const url = isEdit ? `/api/berita/${berita.id}` : "/api/berita";
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Berita" : "Tambah Berita Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update informasi berita"
              : "Buat berita baru untuk website"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Judul */}
            <div className="space-y-2">
              <Label htmlFor="judul">
                Judul Berita <span className="text-red-500">*</span>
              </Label>
              <Input
                id="judul"
                value={judul}
                onChange={(e) => handleJudulChange(e.target.value)}
                placeholder="Masukkan judul berita..."
                required
                maxLength={500}
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
                placeholder="slug-berita"
                required
                maxLength={500}
                pattern="[a-z0-9-]+"
                title="Hanya huruf kecil, angka, dan dash (-)"
              />
              <p className="text-xs text-gray-500">
                URL-friendly identifier (huruf kecil, angka, dan dash)
              </p>
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <Label htmlFor="kategori">
                Kategori <span className="text-red-500">*</span>
              </Label>
              <Select value={kategoriId} onValueChange={setKategoriId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {kategoriList.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">
                Excerpt <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Ringkasan singkat berita..."
                rows={3}
                required
              />
            </div>

            {/* Konten */}
            <div className="space-y-2">
              <Label htmlFor="konten">
                Konten <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="konten"
                value={konten}
                onChange={(e) => setKonten(e.target.value)}
                placeholder="Isi berita lengkap..."
                rows={8}
                required
              />
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <Label htmlFor="featured_image">Featured Image URL</Label>
              <Input
                id="featured_image"
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {featuredImage && (
                <div className="mt-2">
                  <img
                    src={featuredImage}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Published Date */}
            <div className="space-y-2">
              <Label htmlFor="published_at">Tanggal Publish</Label>
              <Input
                id="published_at"
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
              />
            </div>

            {/* Switches */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_published">Status Publish</Label>
                  <p className="text-xs text-gray-500">
                    Berita akan tampil di website jika dipublish
                  </p>
                </div>
                <Switch
                  id="is_published"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_highlight">Highlight</Label>
                  <p className="text-xs text-gray-500">
                    Tampilkan di halaman utama sebagai berita unggulan
                  </p>
                </div>
                <Switch
                  id="is_highlight"
                  checked={isHighlight}
                  onCheckedChange={setIsHighlight}
                />
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
