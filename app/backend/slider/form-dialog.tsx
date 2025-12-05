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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
export interface SliderFormInitialData {
  id?: string;
  judul: string;
  deskripsi: string | null;
  image: string;
  is_published: number;
  created_at?: string | Date;
}

export interface SliderFormValues {
  judul: string;
  deskripsi: string;
  image: string;
  is_published: number;
}

interface SliderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SliderFormValues) => Promise<void>;
  initialData?: SliderFormInitialData | null;
}

export default function SliderFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: SliderFormDialogProps) {
  const [formValues, setFormValues] = useState<SliderFormValues>({
    judul: "",
    deskripsi: "",
    image: "",
    is_published: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormValues({
      judul: initialData?.judul ?? "",
      deskripsi: initialData?.deskripsi ?? "",
      image: initialData?.image ?? "",
      is_published: initialData?.is_published ?? 1,
    });
  }, [initialData, open]);

  const handleChange = (
    field: keyof SliderFormValues,
    value: string | number
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formValues.judul || !formValues.image) return;
    setIsSubmitting(true);
    await onSubmit(formValues);
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Slider" : "Tambah Slider"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Perbarui informasi slider yang dipilih."
              : "Tambahkan slider baru untuk ditampilkan."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="judul">Judul</Label>
            <Input
              id="judul"
              placeholder="Judul slider"
              value={formValues.judul}
              onChange={(e) => handleChange("judul", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              placeholder="Deskripsi singkat"
              value={formValues.deskripsi}
              onChange={(e) => handleChange("deskripsi", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">URL Gambar</Label>
            <Input
              id="image"
              placeholder="https://..."
              value={formValues.image}
              onChange={(e) => handleChange("image", e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label>Published</Label>
              <p className="text-sm text-muted-foreground">
                Tentukan apakah slider langsung dipublikasikan.
              </p>
            </div>
            <Switch
              checked={formValues.is_published === 1}
              onCheckedChange={(checked) =>
                handleChange("is_published", checked ? 1 : 0)
              }
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
