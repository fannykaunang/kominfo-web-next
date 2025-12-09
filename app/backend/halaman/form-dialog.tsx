// app/backend/halaman/form-dialog.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { TinyMCEEditor } from "@/components/tinymce-editor";

interface HalamanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingHalaman: any | null;
  menuOptions: any[];
  onSuccess: () => void;
}

interface HalamanFormProps {
  editingHalaman: any | null;
  menuOptions: any[];
  onSuccess: () => void;
  onCancel?: () => void;
  submitLabel?: string;
}

function HalamanForm({
  editingHalaman,
  menuOptions,
  onSuccess,
  onCancel,
  submitLabel = "Simpan",
}: HalamanFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => ({
    menu_id: editingHalaman?.menu_id ? String(editingHalaman.menu_id) : "",
    judul: editingHalaman?.judul || "",
    slug: editingHalaman?.slug || "",
    konten: editingHalaman?.konten || "",
    excerpt: editingHalaman?.excerpt || "",
    urutan: editingHalaman?.urutan || 0,
    is_published: editingHalaman?.is_published || 1,
    meta_title: editingHalaman?.meta_title || "",
    meta_description: editingHalaman?.meta_description || "",
  }));

  useEffect(() => {
    if (editingHalaman) {
      setFormData({
        menu_id: editingHalaman.menu_id ? String(editingHalaman.menu_id) : "",
        judul: editingHalaman.judul || "",
        slug: editingHalaman.slug || "",
        konten: editingHalaman.konten || "",
        excerpt: editingHalaman.excerpt || "",
        urutan: editingHalaman.urutan || 0,
        is_published: editingHalaman.is_published || 1,
        meta_title: editingHalaman.meta_title || "",
        meta_description: editingHalaman.meta_description || "",
      });
    } else {
      setFormData({
        menu_id: "",
        judul: "",
        slug: "",
        konten: "",
        excerpt: "",
        urutan: 0,
        is_published: 1,
        meta_title: "",
        meta_description: "",
      });
    }
  }, [editingHalaman]);

  const handleJudulChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      judul: value,
      slug: value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.menu_id ||
      !formData.judul ||
      !formData.slug ||
      !formData.konten
    ) {
      toast.error("Menu, judul, slug, dan konten wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const url = editingHalaman
        ? `/api/halaman/${editingHalaman.id}`
        : `/api/halaman`;

      const method = editingHalaman ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save halaman");
      }
      toast.success(
        `Halaman berhasil ${editingHalaman ? "diupdate" : "dibuat"}`
      );

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan halaman");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        {/* Menu & Judul */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="menu_id">
              Menu <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.menu_id || undefined}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, menu_id: value }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih menu" />
              </SelectTrigger>
              <SelectContent>
                {menuOptions.map((menu) => (
                  <SelectItem key={menu.id} value={String(menu.id)}>
                    {menu.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="judul">
              Judul Halaman <span className="text-destructive">*</span>
            </Label>
            <Input
              id="judul"
              placeholder="Contoh: Visi dan Misi"
              value={formData.judul}
              onChange={(e) => handleJudulChange(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">
            Slug <span className="text-destructive">*</span>
          </Label>
          <Input
            id="slug"
            placeholder="visi-dan-misi"
            value={formData.slug}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, slug: e.target.value }))
            }
            required
          />
          <p className="text-xs text-muted-foreground">
            URL: /[menu-slug]/{formData.slug || "halaman-slug"}
          </p>
        </div>

        {/* Konten (TinyMCE) */}
        <div className="space-y-2">
          <Label htmlFor="konten">
            Konten <span className="text-destructive">*</span>
          </Label>
          <div className="border rounded-md">
            <TinyMCEEditor
              value={formData.konten}
              onChange={(content) =>
                setFormData((prev) => ({ ...prev, konten: content }))
              }
            />
          </div>
        </div>

        {/* Excerpt */}
        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            placeholder="Ringkasan singkat halaman..."
            value={formData.excerpt}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                excerpt: e.target.value,
              }))
            }
            rows={3}
          />
        </div>

        {/* Meta Title & Meta Description */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="meta_title">Meta Title (SEO)</Label>
            <Input
              id="meta_title"
              placeholder="Judul untuk SEO"
              value={formData.meta_title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  meta_title: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urutan">Urutan</Label>
            <Input
              id="urutan"
              type="number"
              min="0"
              value={formData.urutan}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  urutan: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>
        </div>

        {/* Meta Description */}
        <div className="space-y-2">
          <Label htmlFor="meta_description">Meta Description (SEO)</Label>
          <Textarea
            id="meta_description"
            placeholder="Deskripsi untuk mesin pencari..."
            value={formData.meta_description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                meta_description: e.target.value,
              }))
            }
            rows={2}
          />
        </div>

        {/* Published */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="is_published">Publish Halaman</Label>
            <p className="text-sm text-muted-foreground">
              Halaman akan tampil di website
            </p>
          </div>
          <Switch
            id="is_published"
            checked={formData.is_published === 1}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                is_published: checked ? 1 : 0,
              }))
            }
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Batal
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}

export function HalamanFormDialog({
  open,
  onOpenChange,
  editingHalaman,
  menuOptions,
  onSuccess,
}: HalamanFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingHalaman ? "Edit Halaman" : "Tambah Halaman"}
          </DialogTitle>
          <DialogDescription>
            {editingHalaman
              ? "Ubah informasi halaman yang sudah ada"
              : "Buat halaman baru dengan konten lengkap"}
          </DialogDescription>
        </DialogHeader>

        <HalamanForm
          editingHalaman={editingHalaman}
          menuOptions={menuOptions}
          onSuccess={onSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export function HalamanFormStandalone({
  editingHalaman,
  menuOptions,
}: {
  editingHalaman: any;
  menuOptions: any[];
}) {
  const router = useRouter();

  return (
    <HalamanForm
      editingHalaman={editingHalaman}
      menuOptions={menuOptions}
      onSuccess={() => router.push("/backend/halaman")}
      onCancel={() => router.push("/backend/halaman")}
      submitLabel="Perbarui Halaman"
    />
  );
}
