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
import { MultipleTagSelect } from "./multiple-tag-select";
import { Tag } from "@/lib/types";

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
  tagsList?: Tag[];
}

export default function BeritaForm({
  berita,
  kategoriList,
  tagsList = [],
}: BeritaFormProps) {
  const router = useRouter();
  const editorRef = useRef<any>(null);

  const [judul, setJudul] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");

  // ADD THESE LINES ↓
  const [galeriFiles, setGaleriFiles] = useState<File[]>([]);
  const [galeriPreviews, setGaleriPreviews] = useState<string[]>([]);
  const [galeriUrls, setGaleriUrls] = useState<string[]>([]);
  const [uploadingGaleri, setUploadingGaleri] = useState(false);

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
  const [selectKey, setSelectKey] = useState(0); // Force re-render
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

      // Ensure kategori_id is string and exists in list
      const kategoriIdStr = String(berita.kategori_id);
      const kategoriExists = kategoriList.some(
        (k) => String(k.id) === kategoriIdStr
      );

      setKategoriId(kategoriIdStr);
      // Force Select to re-render
      setSelectKey((prev) => prev + 1);

      setIsHighlight(!!berita.is_highlight);
      setIsPublished(!!berita.is_published);
      setPublishedAt(
        berita.published_at
          ? new Date(berita.published_at).toISOString().split("T")[0]
          : ""
      );

      if (berita.galeri) {
        try {
          const galeriArray =
            typeof berita.galeri === "string"
              ? JSON.parse(berita.galeri)
              : berita.galeri;
          if (Array.isArray(galeriArray)) {
            setGaleriUrls(galeriArray);
            setGaleriPreviews(galeriArray);
          }
        } catch (e) {
          console.error("Failed to parse galeri:", e);
        }
      }

      // Type assertion karena berita dari API bisa punya tag_ids
      const beritaWithTags = berita as Berita & { tag_ids?: string[] };
      if (beritaWithTags.tag_ids) {
        setSelectedTags(beritaWithTags.tag_ids);
      }
    }
  }, [berita, kategoriList]);

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

  // Handle galeri file selection
  const handleGaleriChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate: max 5 images total
    const totalImages = galeriPreviews.length + files.length;
    if (totalImages > 5) {
      setError(
        `Maksimal 5 gambar untuk galeri. Anda sudah memiliki ${galeriPreviews.length} gambar.`
      );
      return;
    }

    // Validate each file
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError(
          "Format file tidak valid. Hanya JPEG, PNG, GIF, dan WebP yang diperbolehkan."
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran file terlalu besar. Maksimal 5MB per gambar.");
        return;
      }
    }

    // Create previews
    let loadedCount = 0;
    const newPreviews: string[] = [];

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews[index] = e.target?.result as string;
        loadedCount++;

        if (loadedCount === files.length) {
          setGaleriPreviews([...galeriPreviews, ...newPreviews]);
        }
      };
      reader.onerror = () => {
        setError("Gagal membaca file gambar");
      };
      reader.readAsDataURL(file);
    });

    setGaleriFiles([...galeriFiles, ...files]);
    setError("");
  };

  // Remove galeri image
  const handleRemoveGaleriImage = (index: number) => {
    // Determine if this is an uploaded image or new file
    const isUploadedImage = index < galeriUrls.length;

    if (isUploadedImage) {
      // Remove from uploaded URLs
      const newUrls = galeriUrls.filter((_, i) => i !== index);
      setGaleriUrls(newUrls);
    } else {
      // Remove from new files
      const fileIndex = index - galeriUrls.length;
      const newFiles = galeriFiles.filter((_, i) => i !== fileIndex);
      setGaleriFiles(newFiles);
    }

    // Remove from previews
    const newPreviews = galeriPreviews.filter((_, i) => i !== index);
    setGaleriPreviews(newPreviews);
  };

  // Upload all galeri images
  const uploadGaleriImages = async (): Promise<string[]> => {
    if (galeriFiles.length === 0) {
      return galeriUrls;
    }

    setUploadingGaleri(true);
    const uploadedUrls: string[] = [...galeriUrls];

    try {
      for (const file of galeriFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        } else {
          console.error("Failed to upload galeri image");
        }
      }
    } catch (error) {
      console.error("Error uploading galeri:", error);
    } finally {
      setUploadingGaleri(false);
    }

    return uploadedUrls;
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

      // Upload galeri images
      const galeriImageUrls = await uploadGaleriImages();

      const payload = {
        judul,
        slug,
        excerpt,
        konten: editorContent,
        featured_image: imageUrl || undefined,
        galeri: galeriImageUrls,
        kategori_id: kategoriId,
        tag_ids: selectedTags,
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
            <Select
              key={selectKey}
              value={kategoriId}
              onValueChange={setKategoriId}
              required
            >
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

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            {tagsList && tagsList.length > 0 ? (
              <MultipleTagSelect
                tags={tagsList}
                selectedTags={selectedTags}
                onChange={setSelectedTags}
                disabled={loading}
              />
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground border rounded-md">
                Tidak ada tags tersedia
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Pilih satu atau lebih tags untuk berita ini
            </p>
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
            <Label htmlFor="featured_image">Thumbnail Gambar</Label>
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
                    title="Hapus gambar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Galeri */}
          <div className="space-y-2">
            <Label htmlFor="galeri">
              Galeri{" "}
              <span className="text-sm text-muted-foreground">
                (Opsional, maksimal 5 gambar)
              </span>
            </Label>

            {/* Upload Input - Only show if less than 5 images */}
            {galeriPreviews.length < 5 && (
              <Input
                id="galeri"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                multiple
                onChange={handleGaleriChange}
                disabled={uploadingGaleri}
                className="cursor-pointer"
              />
            )}

            {/* Preview Grid */}
            {galeriPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                {galeriPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Galeri ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveGaleriImage(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      title="Hapus gambar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {index + 1}/5
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info Text */}
            <p className="text-sm text-muted-foreground">
              {galeriPreviews.length}/5 gambar. Format: JPEG, PNG, GIF, WebP.
              Maksimal 5MB per gambar.
              {uploadingGaleri && " Sedang mengupload..."}
            </p>
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
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <Button
          type="submit"
          className="w-full md:w-auto"
          disabled={loading || uploadingImage || uploadingGaleri}
        >
          {loading || uploadingImage || uploadingGaleri ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploadingImage || uploadingGaleri
                ? "Mengupload..."
                : isEdit
                ? "Updating..."
                : "Creating..."}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEdit ? "Update Berita" : "Simpan Berita"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
