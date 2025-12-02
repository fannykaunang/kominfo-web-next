"use client";

import { useEffect, useState } from "react";
import { VideoLightbox } from "@/components/galeri/video-lightbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Video, Play } from "lucide-react";

interface GaleriItem {
  id: string;
  judul: string;
  deskripsi: string | null;
  media_url: string;
  thumbnail: string | null;
  kategori: string;
  views: number;
  created_at: string;
}

export default function GaleriVideoPage() {
  const [galeri, setGaleri] = useState<GaleriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<GaleriItem | null>(null);

  // Fetch galeri
  useEffect(() => {
    fetchGaleri();
  }, []);

  const fetchGaleri = async () => {
    try {
      const response = await fetch("/api/galeri/published?media_type=video");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setGaleri(data.galeri || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get YouTube video ID
  const getYouTubeVideoId = (url: string) => {
    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Get YouTube thumbnail
  const getYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  // Handle video click
  const handleVideoClick = (item: GaleriItem) => {
    setCurrentVideo(item);
    setLightboxOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-linear-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            Galeri Video
          </h1>
          <p className="text-lg text-muted-foreground">
            Koleksi video dokumentasi dan informasi
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-video rounded-lg" />
            ))}
          </div>
        ) : galeri.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Video className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Belum ada video</h3>
            <p className="text-muted-foreground">
              Galeri video akan ditampilkan di sini
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galeri.map((item) => {
              const thumbnail =
                item.thumbnail || getYouTubeThumbnail(item.media_url);

              return (
                <div
                  key={item.id}
                  className="group relative cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all"
                  onClick={() => handleVideoClick(item)}>
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={item.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Crect fill='%23e5e7eb' width='640' height='360'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='24'%3ENo Thumbnail%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Video className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/50 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play
                          className="h-8 w-8 text-red-600 ml-1"
                          fill="currentColor"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 bg-card">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {item.judul}
                    </h3>
                    {item.deskripsi && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {item.deskripsi}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="bg-muted px-2 py-1 rounded">
                        {item.kategori}
                      </span>
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
      {currentVideo && (
        <VideoLightbox
          videoUrl={currentVideo.media_url}
          title={currentVideo.judul}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
