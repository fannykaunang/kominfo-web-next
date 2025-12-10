// app/galeri/foto/galeri-foto-client.tsx
"use client";

import { useEffect, useState } from "react";
import { ImageLightbox } from "@/components/galeri/image-lightbox";
import { NewsImage } from "@/components/berita/news-image";
import { Image as ImageIcon, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GaleriItem {
  id: string;
  judul: string;
  deskripsi: string | null;
  media_url: string | string[];
  thumbnail: string | null;
  kategori: string;
  views: number;
  created_at: string;
}

export default function GaleriFotoClient() {
  const [galeri, setGaleri] = useState<GaleriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentGaleri, setCurrentGaleri] = useState<GaleriItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchGaleri();
  }, []);

  const fetchGaleri = async () => {
    try {
      const response = await fetch("/api/galeri/published?media_type=image");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setGaleri(data.galeri || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (item: GaleriItem, imageIndex: number = 0) => {
    setCurrentGaleri(item);
    setCurrentImageIndex(imageIndex);
    setLightboxOpen(true);
  };

  const getCurrentImages = () => {
    if (!currentGaleri) return [];

    const mediaUrl = currentGaleri.media_url;
    if (Array.isArray(mediaUrl)) {
      return mediaUrl;
    }

    try {
      const parsed = JSON.parse(mediaUrl);
      return Array.isArray(parsed) ? parsed : [mediaUrl];
    } catch {
      return [mediaUrl];
    }
  };

  const getFirstImage = (item: GaleriItem) => {
    const mediaUrl = item.media_url;

    if (Array.isArray(mediaUrl)) {
      return mediaUrl[0] || "";
    }

    try {
      const parsed = JSON.parse(mediaUrl);
      return Array.isArray(parsed) ? parsed[0] : mediaUrl;
    } catch {
      return mediaUrl;
    }
  };

  const getImageCount = (item: GaleriItem) => {
    const mediaUrl = item.media_url;

    if (Array.isArray(mediaUrl)) {
      return mediaUrl.length;
    }

    try {
      const parsed = JSON.parse(mediaUrl);
      return Array.isArray(parsed) ? parsed.length : 1;
    } catch {
      return 1;
    }
  };

  if (loading) {
    return null; // Skeleton sudah di-handle oleh parent
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ImageIcon className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Galeri Foto</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Dokumentasi kegiatan dan momen penting dalam gambar
          </p>
        </header>

        {/* Content */}
        {galeri.length === 0 ? (
          <div className="text-center py-16">
            <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Belum Ada Galeri Foto
            </h2>
            <p className="text-muted-foreground">
              Galeri foto akan ditampilkan di sini
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galeri.map((item) => {
              const imageCount = getImageCount(item);
              const firstImage = getFirstImage(item);

              return (
                <article
                  key={item.id}
                  className="group cursor-pointer"
                  onClick={() => openLightbox(item, 0)}
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <NewsImage
                      src={firstImage}
                      alt={item.judul}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />

                    {imageCount > 1 && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-black/70 text-white hover:bg-black/80">
                          +{imageCount - 1}
                        </Badge>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-[1]">
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                        <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                          {item.judul}
                        </h3>
                        {item.deskripsi && (
                          <p className="text-sm opacity-90 line-clamp-2 mb-2">
                            {item.deskripsi}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs opacity-80">
                          <span>{item.kategori}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{item.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 lg:hidden">
                    <h3 className="font-semibold line-clamp-2 mb-1">
                      {item.judul}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{item.kategori}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{item.views}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {currentGaleri && (
        <ImageLightbox
          images={getCurrentImages()}
          initialIndex={currentImageIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          titles={getCurrentImages().map(() => currentGaleri.judul)}
        />
      )}
    </div>
  );
}
