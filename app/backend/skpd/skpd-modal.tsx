// app/backend/skpd/skpd-modal.tsx

"use client";

import { useState, useEffect } from "react";
import { SKPD, SKPDInput } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SKPDModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skpd: SKPD | null;
  onSuccess: () => void;
}

export default function SKPDModal({
  open,
  onOpenChange,
  skpd,
  onSuccess,
}: SKPDModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SKPDInput>({
    nama: "",
    singkatan: "",
    kategori: "Dinas",
    alamat: "",
    telepon: "",
    email: "",
    website: "",
    kepala: "",
    deskripsi: "",
  });

  // Load existing data when editing
  useEffect(() => {
    if (skpd) {
      setFormData({
        nama: skpd.nama,
        singkatan: skpd.singkatan,
        kategori: skpd.kategori,
        alamat: skpd.alamat || "",
        telepon: skpd.telepon || "",
        email: skpd.email || "",
        website: skpd.website || "",
        kepala: skpd.kepala || "",
        deskripsi: skpd.deskripsi || "",
      });
    } else {
      // Reset form for new SKPD
      setFormData({
        nama: "",
        singkatan: "",
        kategori: "Dinas",
        alamat: "",
        telepon: "",
        email: "",
        website: "",
        kepala: "",
        deskripsi: "",
      });
    }
  }, [skpd, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = skpd ? `/api/backend/skpd/${skpd.id}` : "/api/backend/skpd";
      const method = skpd ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(`SKPD berhasil ${skpd ? "diperbarui" : "ditambahkan"}`);
        onSuccess();
      } else {
        const data = await res.json();
        toast.error(data.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal menyimpan data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {skpd ? "Edit SKPD" : "Tambah SKPD Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama SKPD */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="nama">
                Nama SKPD <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                placeholder="Contoh: Dinas Pendidikan dan Kebudayaan"
                required
                disabled={isLoading}
              />
            </div>

            {/* Singkatan */}
            <div className="space-y-2">
              <Label htmlFor="singkatan">
                Singkatan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="singkatan"
                value={formData.singkatan}
                onChange={(e) =>
                  setFormData({ ...formData, singkatan: e.target.value })
                }
                placeholder="Contoh: DISDIKBUD"
                required
                disabled={isLoading}
              />
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <Label htmlFor="kategori">
                Kategori <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.kategori}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    kategori: value as SKPDInput["kategori"],
                  })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sekretariat">Sekretariat</SelectItem>
                  <SelectItem value="Dinas">Dinas</SelectItem>
                  <SelectItem value="Badan">Badan</SelectItem>
                  <SelectItem value="Inspektorat">Inspektorat</SelectItem>
                  <SelectItem value="Satuan">Satuan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Kepala SKPD */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="kepala">Kepala SKPD</Label>
              <Input
                id="kepala"
                value={formData.kepala}
                onChange={(e) =>
                  setFormData({ ...formData, kepala: e.target.value })
                }
                placeholder="Contoh: Dr. H. Ahmad Malik, S.Sos., M.Si"
                disabled={isLoading}
              />
            </div>

            {/* Alamat */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Input
                id="alamat"
                value={formData.alamat}
                onChange={(e) =>
                  setFormData({ ...formData, alamat: e.target.value })
                }
                placeholder="Contoh: Jl. Raya Mandala No. 1, Merauke"
                disabled={isLoading}
              />
            </div>

            {/* Telepon */}
            <div className="space-y-2">
              <Label htmlFor="telepon">Telepon</Label>
              <Input
                id="telepon"
                value={formData.telepon}
                onChange={(e) =>
                  setFormData({ ...formData, telepon: e.target.value })
                }
                placeholder="Contoh: (0971) 321 015"
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Contoh: setda@meraukekab.go.id"
                disabled={isLoading}
              />
            </div>

            {/* Website */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="Contoh: https://setda.meraukekab.go.id"
                disabled={isLoading}
              />
            </div>

            {/* Deskripsi */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
                placeholder="Deskripsi singkat tentang tugas dan fungsi SKPD"
                rows={3}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>{skpd ? "Perbarui" : "Tambah"} SKPD</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
