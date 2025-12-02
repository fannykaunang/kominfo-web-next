"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

interface MenuFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMenu: any | null;
  onSuccess: () => void;
}

const lucideIcons = [
  "Home",
  "Building2",
  "MapPin",
  "Users",
  "FileText",
  "Image",
  "Calendar",
  "Mail",
  "Phone",
  "Info",
  "Settings",
  "Star",
  "Heart",
  "Award",
  "Briefcase",
];

export function MenuFormDialog({
  open,
  onOpenChange,
  editingMenu,
  onSuccess,
}: MenuFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    slug: "",
    icon: "",
    urutan: 0,
    is_published: 1,
    deskripsi: "",
  });

  // Load editing data
  useEffect(() => {
    if (editingMenu) {
      setFormData({
        nama: editingMenu.nama || "",
        slug: editingMenu.slug || "",
        icon: editingMenu.icon || "",
        urutan: editingMenu.urutan || 0,
        is_published: editingMenu.is_published || 1,
        deskripsi: editingMenu.deskripsi || "",
      });
    } else {
      setFormData({
        nama: "",
        slug: "",
        icon: "",
        urutan: 0,
        is_published: 1,
        deskripsi: "",
      });
    }
  }, [editingMenu, open]);

  // Auto generate slug
  const handleNamaChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      nama: value,
      slug: value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    }));
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.nama || !formData.slug) {
      toast.error("Nama dan slug wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const url = editingMenu ? `/api/menu/${editingMenu.id}` : `/api/menu`;

      const method = editingMenu ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save menu");
      }

      toast.success(`Menu berhasil ${editingMenu ? "diupdate" : "dibuat"}`);

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan menu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editingMenu ? "Edit Menu" : "Tambah Menu"}</DialogTitle>
          <DialogDescription>
            {editingMenu
              ? "Ubah informasi menu yang sudah ada"
              : "Buat menu baru untuk navigasi website"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* Nama */}
            <div className="space-y-2">
              <Label htmlFor="nama">
                Nama Menu <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nama"
                placeholder="Contoh: Organisasi"
                value={formData.nama}
                onChange={(e) => handleNamaChange(e.target.value)}
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug <span className="text-destructive">*</span>
              </Label>
              <Input
                id="slug"
                placeholder="organisasi"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                URL: /{formData.slug || "menu-slug"}
              </p>
            </div>

            {/* Icon & Urutan */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (Lucide React)</Label>
                <Select
                  value={formData.icon || "none"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      icon: value === "none" ? "" : value,
                    }))
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih icon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa Icon</SelectItem>
                    {lucideIcons.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            {/* Deskripsi */}
            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                placeholder="Deskripsi singkat menu..."
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deskripsi: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            {/* Published */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="is_published">Publish Menu</Label>
                <p className="text-sm text-muted-foreground">
                  Menu akan tampil di website
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
