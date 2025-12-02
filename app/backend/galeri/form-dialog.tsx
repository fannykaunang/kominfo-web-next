"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Plus,
} from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Galeri {
  id: string;
  judul: string;
  deskripsi: string | null;
  media_type: "image" | "video";
  media_url: string; // JSON string for images OR YouTube URL for video
  thumbnail: string | null;
  kategori: string;
  is_published: number;
  urutan: number;
}

interface GaleriFormDialogProps {
  open: boolean;
  onClose: () => void;
  galeri: Galeri | null;
  kategoriList: string[];
}

export function GaleriFormDialog({
  open,
  onClose,
  galeri,
  kategoriList,
}: GaleriFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    judul: "",
    deskripsi: "",
    media_type: "image" as "image" | "video",
    kategori: "",
    urutan: 0,
    is_published: true,
  });

  // State for multiple images
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [previewThumbnail, setPreviewThumbnail] = useState<string>("");
  const [youtubeValid, setYoutubeValid] = useState<boolean | null>(null);

  // Parse media_url from JSON
  const parseMediaUrl = (mediaUrl: string): string[] => {
    try {
      const parsed = JSON.parse(mediaUrl);
      return Array.isArray(parsed) ? parsed : [mediaUrl];
    } catch {
      return [mediaUrl];
    }
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (galeri) {
        // Edit mode
        setFormData({
          judul: galeri.judul,
          deskripsi: galeri.deskripsi || "",
          media_type: galeri.media_type,
          kategori: galeri.kategori,
          urutan: galeri.urutan,
          is_published: galeri.is_published === 1,
        });

        if (galeri.media_type === "image") {
          // Parse JSON array
          const images = parseMediaUrl(galeri.media_url);
          setUploadedImages(images);
          setVideoUrl("");
        } else {
          // Video URL
          setUploadedImages([]);
          setVideoUrl(galeri.media_url);
        }

        setPreviewThumbnail(galeri.thumbnail || "");
      } else {
        // Add mode
        setFormData({
          judul: "",
          deskripsi: "",
          media_type: "image",
          kategori: "",
          urutan: 0,
          is_published: true,
        });
        setUploadedImages([]);
        setVideoUrl("");
        setPreviewThumbnail("");
      }
      setYoutubeValid(null);
    }
  }, [open, galeri]);

  // Validate YouTube URL
  useEffect(() => {
    if (formData.media_type === "video" && videoUrl) {
      const youtubeRegex =
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      setYoutubeValid(youtubeRegex.test(videoUrl));
    } else {
      setYoutubeValid(null);
    }
  }, [videoUrl, formData.media_type]);

  // Handle multiple file upload
  const handleMultipleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate max 5 images
    if (uploadedImages.length + files.length > 5) {
      toast.error("Maksimal 5 gambar");
      return;
    }

    // Validate file types and sizes
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const maxSize = 5 * 1024 * 1024;

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name}: Tipe file tidak didukung`);
        return;
      }
      if (file.size > maxSize) {
        toast.error(`File ${file.name}: Ukuran terlalu besar (max 5MB)`);
        return;
      }
    }

    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("type", "galeri");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();

      // Handle response (single or multiple)
      if (data.files) {
        // Multiple files
        const urls = data.files.map((f: any) => f.url);
        setUploadedImages((prev) => [...prev, ...urls]);
        toast.success(`${data.count} gambar berhasil diupload`);
      } else if (data.url) {
        // Single file
        setUploadedImages((prev) => [...prev, data.url]);
        toast.success("Gambar berhasil diupload");
      }
    } catch (error: any) {
      console.error("Error uploading:", error);
      toast.error(error.message || "Gagal mengupload gambar");
    } finally {
      setUploading(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipe file tidak didukung");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Ukuran file terlalu besar (max 5MB)");
      return;
    }

    setUploadingThumbnail(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "thumbnail");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      setPreviewThumbnail(data.url);
      toast.success("Thumbnail berhasil diupload");
    } catch (error: any) {
      console.error("Error uploading:", error);
      toast.error(error.message || "Gagal mengupload thumbnail");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // Handle media type change
  const handleMediaTypeChange = (value: "image" | "video") => {
    setFormData((prev) => ({ ...prev, media_type: value }));

    if (value === "image") {
      setVideoUrl("");
      setPreviewThumbnail("");
      setYoutubeValid(null);
    } else {
      setUploadedImages([]);
    }
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove thumbnail
  const handleRemoveThumbnail = () => {
    setPreviewThumbnail("");
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.judul.trim()) {
      toast.error("Judul harus diisi");
      return;
    }

    if (formData.media_type === "image") {
      if (uploadedImages.length === 0) {
        toast.error("Minimal 1 gambar harus diupload");
        return;
      }
    } else {
      if (!videoUrl.trim()) {
        toast.error("URL YouTube harus diisi");
        return;
      }
      if (!youtubeValid) {
        toast.error("URL YouTube tidak valid");
        return;
      }
    }

    if (!formData.kategori.trim()) {
      toast.error("Kategori harus diisi");
      return;
    }

    setLoading(true);

    try {
      const url = galeri ? `/api/galeri/${galeri.id}` : "/api/galeri";

      const payload = {
        judul: formData.judul.trim(),
        deskripsi: formData.deskripsi.trim() || null,
        media_type: formData.media_type,
        media_url:
          formData.media_type === "image" ? uploadedImages : videoUrl.trim(),
        thumbnail:
          formData.media_type === "video" ? previewThumbnail || null : null,
        kategori: formData.kategori.trim(),
        urutan: formData.urutan,
        is_published: formData.is_published ? 1 : 0,
      };

      const response = await fetch(url, {
        method: galeri ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save");
      }

      toast.success(
        galeri ? "Galeri berhasil diupdate" : "Galeri berhasil ditambahkan"
      );
      onClose();
    } catch (error: any) {
      console.error("Error saving:", error);
      toast.error(error.message || "Gagal menyimpan galeri");
    } finally {
      setLoading(false);
    }
  };

  // Get YouTube video ID for preview
  const getYouTubeVideoId = (url: string) => {
    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const youtubeVideoId =
    formData.media_type === "video" && videoUrl
      ? getYouTubeVideoId(videoUrl)
      : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{galeri ? "Edit Galeri" : "Tambah Galeri"}</DialogTitle>
          <DialogDescription>
            {galeri
              ? "Update informasi galeri"
              : "Tambahkan foto atau video baru ke galeri"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Judul */}
          <div className="space-y-2">
            <Label htmlFor="judul">
              Judul <span className="text-destructive">*</span>
            </Label>
            <Input
              id="judul"
              value={formData.judul}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, judul: e.target.value }))
              }
              placeholder="Masukkan judul"
              required
            />
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Textarea
              id="deskripsi"
              value={formData.deskripsi}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, deskripsi: e.target.value }))
              }
              placeholder="Masukkan deskripsi (opsional)"
              rows={3}
            />
          </div>

          {/* Media Type */}
          <div className="space-y-2">
            <Label>
              Tipe Media <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={formData.media_type}
              onValueChange={(value) =>
                handleMediaTypeChange(value as "image" | "video")
              }
              className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="image" id="image" />
                <Label htmlFor="image" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span>Image (Max 5)</span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <span>Video (YouTube)</span>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Conditional: Image Upload */}
          {formData.media_type === "image" && (
            <div className="space-y-2">
              <Label>
                Upload Gambar ({uploadedImages.length}/5){" "}
                <span className="text-destructive">*</span>
              </Label>

              {/* Image Grid */}
              <div className="grid grid-cols-5 gap-3">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                      {index + 1}
                    </span>
                  </div>
                ))}

                {/* Add More Button */}
                {uploadedImages.length < 5 && (
                  <div>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleMultipleFileChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label
                      htmlFor="image-upload"
                      className="cursor-pointer border-2 border-dashed rounded h-24 flex flex-col items-center justify-center gap-1 hover:bg-muted transition-colors">
                      {uploading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          <span className="text-xs">Upload...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-5 w-5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Add
                          </span>
                        </>
                      )}
                    </Label>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Klik Add untuk upload gambar. Maksimal 5 gambar, masing-masing
                max 5MB
              </p>
            </div>
          )}

          {/* Conditional: Video URL */}
          {formData.media_type === "video" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="video_url">
                  YouTube URL <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="video_url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="pl-10"
                  />
                </div>
                {youtubeValid === false && (
                  <p className="text-sm text-destructive">
                    URL YouTube tidak valid
                  </p>
                )}
                {youtubeValid === true && (
                  <p className="text-sm text-green-600">✓ URL valid</p>
                )}
              </div>

              {/* Video Preview */}
              {youtubeVideoId && (
                <div className="space-y-2">
                  <Label>Preview Video</Label>
                  <div className="aspect-video rounded overflow-hidden border">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Thumbnail Upload (Optional) */}
              <div className="space-y-2">
                <Label>Upload Thumbnail (Opsional)</Label>

                {previewThumbnail ? (
                  <div className="relative inline-block">
                    <img
                      src={previewThumbnail}
                      alt="Thumbnail"
                      className="max-h-48 rounded border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <Label
                      htmlFor="thumbnail-upload"
                      className="cursor-pointer flex flex-col items-center gap-2">
                      {uploadingThumbnail ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          <span className="text-sm">Mengupload...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <span className="text-sm">
                            Click untuk upload thumbnail
                          </span>
                          <span className="text-xs text-muted-foreground">
                            JPEG, PNG, WEBP, GIF (Max 5MB)
                          </span>
                        </>
                      )}
                    </Label>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Kategori */}
          <div className="space-y-2">
            <Label htmlFor="kategori">
              Kategori <span className="text-destructive">*</span>
            </Label>
            <Input
              id="kategori"
              value={formData.kategori}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, kategori: e.target.value }))
              }
              placeholder="Masukkan kategori"
              list="kategori-list"
              required
            />
            {kategoriList.length > 0 && (
              <datalist id="kategori-list">
                {kategoriList.map((kat) => (
                  <option key={kat} value={kat} />
                ))}
              </datalist>
            )}
          </div>

          {/* Urutan */}
          <div className="space-y-2">
            <Label htmlFor="urutan">Urutan</Label>
            <Input
              id="urutan"
              type="number"
              value={formData.urutan}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  urutan: parseInt(e.target.value) || 0,
                }))
              }
              placeholder="0"
              min="0"
            />
            <p className="text-xs text-muted-foreground">
              Semakin kecil angka, semakin atas urutannya
            </p>
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Status Publikasi</Label>
              <p className="text-xs text-muted-foreground">
                Tentukan apakah galeri akan ditampilkan di website
              </p>
            </div>
            <Switch
              checked={formData.is_published}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_published: checked }))
              }
            />
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading || uploading || uploadingThumbnail}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : galeri ? (
                "Update"
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
