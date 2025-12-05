"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFormValues({
      judul: initialData?.judul ?? "",
      deskripsi: initialData?.deskripsi ?? "",
      image: initialData?.image ?? "",
      is_published: initialData?.is_published ?? 1,
    });
    setImagePreview(initialData?.image ?? "");
  }, [initialData, open]);

  const handleChange = (
    field: keyof SliderFormValues,
    value: string | number
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formValues.judul || !formValues.image) {
      toast.error("Judul dan gambar wajib diisi");
      return;
    }
    if (uploadingImage) {
      toast.info("Tunggu hingga proses upload selesai");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formValues);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF."
      );
      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Ukuran file terlalu besar. Maksimal 5MB.");
      event.target.value = "";
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "slider");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengupload gambar");
      }

      handleChange("image", data.url);
      setImagePreview(data.url);
      toast.success("Gambar berhasil diupload");
    } catch (error: any) {
      toast.error(error.message || "Gagal mengupload gambar");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    handleChange("image", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
            <Label htmlFor="image">
              Upload Gambar <span className="text-destructive">*</span>
            </Label>
            <Input
              id="image"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              disabled={uploadingImage}
              ref={fileInputRef}
            />
            <p className="text-xs text-muted-foreground">
              Format yang didukung: JPG, JPEG, PNG, WEBP, atau GIF. Maksimum 1
              file dengan ukuran 5MB.
            </p>

            {imagePreview && (
              <div className="flex items-center gap-3 rounded-md border p-3">
                <img
                  src={imagePreview}
                  alt="Preview gambar slider"
                  className="h-16 w-24 rounded object-cover"
                />
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Gambar terpilih</span>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={uploadingImage}
                    >
                      Hapus
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      Ganti
                    </Button>
                  </div>
                </div>
              </div>
            )}
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
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || uploadingImage}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
