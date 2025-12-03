// components/berita/news-image.tsx

"use client";

import { useState } from "react";
import Image from "next/image";

interface NewsImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

export function NewsImage({
  src,
  alt,
  fill = true,
  className = "",
  sizes,
  priority,
  width,
  height,
}: NewsImageProps) {
  const [imgSrc, setImgSrc] = useState(src || "/placeholder.jpg");
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Set to inline SVG fallback
      setImgSrc(
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect fill='%23e5e7eb' width='800' height='450'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='24' font-family='system-ui'%3ENo Image%3C/text%3E%3C/svg%3E"
      );
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={handleError}
      unoptimized={hasError} // Don't optimize SVG data URI
    />
  );
}

// Compact version for smaller images
export function NewsImageCompact({
  src,
  alt,
  fill = true,
  className = "",
  sizes,
}: NewsImageProps) {
  const [imgSrc, setImgSrc] = useState(src || "/placeholder.jpg");
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23e5e7eb' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='10'%3ENo Image%3C/text%3E%3C/svg%3E"
      );
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      onError={handleError}
      unoptimized={hasError}
    />
  );
}

// Horizontal version
export function NewsImageHorizontal({
  src,
  alt,
  fill = true,
  className = "",
  sizes,
}: NewsImageProps) {
  const [imgSrc, setImgSrc] = useState(src || "/placeholder.jpg");
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Crect fill='%23e5e7eb' width='640' height='360'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='20'%3ENo Image%3C/text%3E%3C/svg%3E"
      );
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      onError={handleError}
      unoptimized={hasError}
    />
  );
}
