"use client";

import { useEffect, useState } from "react";
import { ImageLightbox } from "@/components/galeri/image-lightbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Image as ImageIcon } from "lucide-react";

interface GaleriItem {
  id: string;
  judul: string;
  deskripsi: string | null;
  media_url: string;
  kategori: string;
  views: number;
  created_at: string;
}

export default function GaleriFotoPage() {
  const [galeri, setGaleri] = useState<GaleriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentGaleri, setCurrentGaleri] = useState<GaleriItem | null>(null);

  // Fetch galeri
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

  // Parse media_url (JSON array or single string)
  const parseMediaUrl = (mediaUrl: string): string[] => {
    try {
      const parsed = JSON.parse(mediaUrl);
      return Array.isArray(parsed) ? parsed : [mediaUrl];
    } catch {
      return [mediaUrl];
    }
  };

  // Handle image click
  const handleImageClick = (item: GaleriItem, imageIndex: number = 0) => {
    setCurrentGaleri(item);
    setCurrentImageIndex(imageIndex);
    setLightboxOpen(true);
  };

  // Get all images from current galeri
  const getCurrentImages = (): string[] => {
    if (!currentGaleri) return [];
    return parseMediaUrl(currentGaleri.media_url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-linear-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            Galeri Foto
          </h1>
          <p className="text-lg text-muted-foreground">
            Dokumentasi kegiatan dan momen penting
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : galeri.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Belum ada foto</h3>
            <p className="text-muted-foreground">
              Galeri foto akan ditampilkan di sini
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {galeri.map((item) => {
              const images = parseMediaUrl(item.media_url);
              const firstImage = images[0];
              const imageCount = images.length;

              return (
                <div
                  key={item.id}
                  className="group relative cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all"
                  onClick={() => handleImageClick(item, 0)}>
                  {/* Image */}
                  <div className="relative aspect-square bg-muted">
                    <img
                      src={firstImage}
                      alt={item.judul}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='20'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />

                    {/* Image Count Badge */}
                    {imageCount > 1 && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        {imageCount}
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white translate-y-full group-hover:translate-y-0 transition-transform">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                      {item.judul}
                    </h3>
                    {item.deskripsi && (
                      <p className="text-sm opacity-90 line-clamp-2">
                        {item.deskripsi}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs opacity-80">
                      <span>{item.kategori}</span>
                      <span>•</span>
                      <span>{item.views} views</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
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
