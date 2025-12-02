"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoLightboxProps {
  videoUrl: string;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoLightbox({
  videoUrl,
  title,
  isOpen,
  onClose,
}: VideoLightboxProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Extract YouTube video ID
  const getYouTubeVideoId = (url: string) => {
    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeVideoId(videoUrl);

  if (!isOpen || !videoId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}>
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:bg-white/20 z-10">
        <X className="h-6 w-6" />
      </Button>

      {/* Video Container */}
      <div
        className="relative w-full max-w-6xl mx-4"
        onClick={(e) => e.stopPropagation()}>
        {/* Video */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Title */}
        {title && (
          <div className="mt-4 text-white text-center">
            <h3 className="text-xl font-semibold">{title}</h3>
          </div>
        )}
      </div>
    </div>
  );
}
