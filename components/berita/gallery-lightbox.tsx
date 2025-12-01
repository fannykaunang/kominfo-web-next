// components/berita/gallery-lightbox.tsx

"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { Eye } from "lucide-react";

interface GalleryLightboxProps {
  images: string[];
  title: string;
}

export default function GalleryLightbox({
  images,
  title,
}: GalleryLightboxProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Convert images to lightbox format
  const slides = images.map((src) => ({
    src,
    alt: title,
    width: 1200,
    height: 800,
  }));

  return (
    <>
      {/* Gallery Grid */}
      <div className="mt-8 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-2">Galeri Foto</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {images.length} foto dalam galeri berita ini. Klik untuk melihat
          ukuran penuh.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              onClick={() => handleImageClick(index)}
              className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-primary transition-all shadow-sm hover:shadow-md">
              {/* Background Image - Simple approach */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundImage: `url('${image}')`,
                }}
              />

              {/* Dark overlay on hover */}
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-black/20 opacity-0 group-hover:opacity-50 transition-opacity duration-300 z-10" />

              {/* Eye icon - appears on hover */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="transform scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-3 shadow-xl">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>

              {/* Counter badge - always visible */}
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-md z-30">
                {index + 1}/{images.length}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={slides}
        plugins={[Zoom, Thumbnails]}
        zoom={{
          maxZoomPixelRatio: 3,
          scrollToZoom: true,
        }}
        thumbnails={{
          position: "bottom",
          width: 120,
          height: 80,
          border: 1,
          borderRadius: 4,
          padding: 4,
          gap: 16,
        }}
        carousel={{
          finite: true,
        }}
        controller={{
          closeOnBackdropClick: true,
        }}
        render={{
          buttonPrev: images.length > 1 ? undefined : () => null,
          buttonNext: images.length > 1 ? undefined : () => null,
        }}
      />
    </>
  );
}
