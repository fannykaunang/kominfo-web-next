"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Berita, Kategori } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, ArrowLeft, Save, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

import dynamic from "next/dynamic";

// Import TinyMCE Editor hanya di client (SSR dimatikan)
const TinyMCEEditor = dynamic(
  () => import("@tinymce/tinymce-react").then((m) => m.Editor),
  {
    ssr: false,
    loading: () => (
      <p className="p-2 text-sm text-gray-500">Memuat editor...</p>
    ),
  }
);

interface BeritaFormProps {
  berita?: Berita | null;
  kategoriList: Kategori[];
}

export default function BeritaForm({ berita, kategoriList }: BeritaFormProps) {
  const router = useRouter();
  const editorRef = useRef<any>(null);

  const [judul, setJudul] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [konten, setKonten] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
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
      setImagePreview(berita.featured_image || "");
      setKategoriId(berita.kategori_id);
      setIsHighlight(!!berita.is_highlight);
      setIsPublished(!!berita.is_published);
      setPublishedAt(
        berita.published_at
          ? new Date(berita.published_at).toISOString().split("T")[0]
          : ""
      );
    }
  }, [berita]);

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

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError(
        "Format file tidak valid. Hanya JPEG, PNG, GIF, dan WebP yang diperbolehkan."
      );
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("Ukuran file terlalu besar. Maksimal 5MB.");
      return;
    }

    setImageFile(file);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload image to server
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return featuredImage || null;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      return data.url;
    } catch (err: any) {
      setError(`Upload gambar gagal: ${err.message}`);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFeaturedImage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Upload image first if there's a new file
      let imageUrl = featuredImage;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          throw new Error("Failed to upload image");
        }
        imageUrl = uploadedUrl;
      }

      // Get content from TinyMCE
      const editorContent = editorRef.current?.getContent() || konten;

      const payload = {
        judul,
        slug,
        excerpt,
        konten: editorContent,
        featured_image: imageUrl || undefined,
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

      // Redirect back to list
      router.push("/backend/berita");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Berita</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {/* Konten with TinyMCE */}
          <div className="space-y-2">
            <Label htmlFor="konten">
              Konten <span className="text-red-500">*</span>
            </Label>
            <div className="border rounded-md">
              <TinyMCEEditor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY} // Ganti dengan API key TinyMCE Anda
                onInit={(evt, editor) => (editorRef.current = editor)}
                initialValue={konten}
                init={{
                  height: 500,
                  menubar: true,
                  plugins: [
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "code",
                    "help",
                    "wordcount",
                  ],
                  toolbar:
                    "undo redo | blocks | " +
                    "bold italic forecolor | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist outdent indent | " +
                    "removeformat | image media link | code | help",
                  content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                  images_upload_handler: (blobInfo: any) =>
                    new Promise<string>((resolve, reject) => {
                      // Handle image upload here
                      // For now, just convert to base64
                      const reader = new FileReader();
                      reader.onload = () => {
                        resolve(reader.result as string);
                      };
                      reader.onerror = reject;
                      reader.readAsDataURL(blobInfo.blob());
                    }),
                }}
              />
            </div>
          </div>

          {/* Featured Image */}
          <div className="space-y-2">
            <Label htmlFor="featured_image">Featured Image</Label>
            <div className="space-y-3">
              {/* File Input */}
              <div className="flex items-center gap-2">
                <Input
                  id="featured_image"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                  className="cursor-pointer"
                />
                {uploadingImage && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                )}
              </div>
              <p className="text-xs text-gray-500">
                Format: JPEG, PNG, GIF, WebP. Maksimal 5MB.
              </p>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Hapus gambar">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
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
        </CardContent>
      </Card>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/backend/berita")}
          disabled={loading}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          {isEdit ? "Update Berita" : "Simpan Berita"}
        </Button>
      </div>
    </form>
  );
}
