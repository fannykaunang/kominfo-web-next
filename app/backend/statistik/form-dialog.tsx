"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Statistik, StatistikCreateInput } from "@/lib/types";

interface StatistikFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StatistikCreateInput) => Promise<void>;
  initialData?: Statistik | null;
}

type StatistikFormValues = StatistikCreateInput;

export default function StatistikFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: StatistikFormDialogProps) {
  const [formData, setFormData] = useState<StatistikFormValues>({
    judul: initialData?.judul ?? "",
    nilai: initialData?.nilai ?? "",
    satuan: initialData?.satuan ?? "",
    icon: initialData?.icon ?? "",
    kategori: initialData?.kategori ?? "",
    urutan: initialData?.urutan ?? 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      judul: initialData?.judul ?? "",
      nilai: initialData?.nilai ?? "",
      satuan: initialData?.satuan ?? "",
      icon: initialData?.icon ?? "",
      kategori: initialData?.kategori ?? "",
      urutan: initialData?.urutan ?? 0,
    });
  }, [initialData, open]);

  const handleChange = (
    field: keyof StatistikFormValues,
    value: string | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.judul || !formData.nilai || !formData.kategori) {
      return;
    }
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Statistik" : "Tambah Statistik"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Perbarui detail statistik yang ada."
              : "Tambahkan data statistik baru untuk ditampilkan."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="judul">Judul</Label>
            <Input
              id="judul"
              placeholder="Contoh: Jumlah Penduduk"
              value={formData.judul as string}
              onChange={(e) => handleChange("judul", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nilai">Nilai</Label>
              <Input
                id="nilai"
                placeholder="Contoh: 234,617"
                value={formData.nilai as string}
                onChange={(e) => handleChange("nilai", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="satuan">Satuan</Label>
              <Input
                id="satuan"
                placeholder="Contoh: jiwa"
                value={(formData.satuan as string) ?? ""}
                onChange={(e) => handleChange("satuan", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Input
                id="kategori"
                placeholder="Contoh: demografi"
                value={formData.kategori as string}
                onChange={(e) => handleChange("kategori", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                placeholder="Contoh: users"
                value={(formData.icon as string) ?? ""}
                onChange={(e) => handleChange("icon", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urutan">Urutan</Label>
            <Input
              id="urutan"
              type="number"
              value={formData.urutan ?? 0}
              onChange={(e) => handleChange("urutan", Number(e.target.value))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
