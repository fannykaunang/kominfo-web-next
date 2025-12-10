// app/galeri/video/galeri-video-client.tsx
"use client";

import { useEffect, useState } from "react";
import { VideoLightbox } from "@/components/galeri/video-lightbox";
import { NewsImage } from "@/components/berita/news-image";
import { Video, Play, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export default function GaleriVideoClient() {
  const [galeri, setGaleri] = useState<GaleriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<GaleriItem | null>(null);

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

  const getYouTubeVideoId = (url: string) => {
    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : "/placeholder-video.jpg";
  };

  const openLightbox = (item: GaleriItem) => {
    setCurrentVideo(item);
    setLightboxOpen(true);
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
            <Video className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Galeri Video</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Koleksi video dokumentasi kegiatan dan acara
          </p>
        </header>

        {/* Content */}
        {galeri.length === 0 ? (
          <div className="text-center py-16">
            <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Belum Ada Galeri Video
            </h2>
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
                <article
                  key={item.id}
                  className="group cursor-pointer"
                  onClick={() => openLightbox(item)}
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <NewsImage
                      src={thumbnail}
                      alt={item.judul}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />

                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors z-[1]">
                      <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center transform group-hover:scale-110 transition-all">
                        <Play
                          className="h-8 w-8 text-primary ml-1"
                          fill="currentColor"
                        />
                      </div>
                    </div>

                    {/* Category badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-primary/90 hover:bg-primary">
                        {item.kategori}
                      </Badge>
                    </div>

                    {/* Video info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity z-[1]">
                      <h3 className="font-semibold text-white text-lg mb-1 line-clamp-2">
                        {item.judul}
                      </h3>
                      {item.deskripsi && (
                        <p className="text-sm text-white/80 line-clamp-2 mb-2">
                          {item.deskripsi}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-white/70">
                        <Eye className="h-3 w-3" />
                        <span>{item.views} views</span>
                      </div>
                    </div>
                  </div>

                  {/* Title below video (visible on mobile) */}
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
