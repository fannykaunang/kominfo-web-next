// components/berita/news-image-simple.tsx
"use client";

import { useState, useRef, useEffect } from "react";

interface NewsImageSimpleProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

const DEFAULT_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect fill='%23374151' width='800' height='450'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='24' font-family='system-ui'%3ENo Image%3C/text%3E%3C/svg%3E";

export function NewsImageSimple({
  src,
  alt,
  className = "",
}: NewsImageSimpleProps) {
  // If no src, use fallback immediately
  const initialSrc = src && src.trim() !== "" ? src : DEFAULT_FALLBACK;
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(!src || src.trim() === "");
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle image error
  const handleError = () => {
    console.log("Image failed to load:", src);
    if (!hasError) {
      setHasError(true);
      setImgSrc(DEFAULT_FALLBACK);
    }
  };

  // Handle successful load
  const handleLoad = () => {
    console.log("Image loaded successfully:", src);
  };

  // Check if image src changed
  useEffect(() => {
    if (src && src.trim() !== "" && src !== imgSrc) {
      setImgSrc(src);
      setHasError(false);
    } else if (!src || src.trim() === "") {
      setImgSrc(DEFAULT_FALLBACK);
      setHasError(true);
    }
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imgSrc}
      alt={alt || "News image"}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
}

// Compact version for smaller images
export function NewsImageCompactSimple({
  src,
  alt,
  className = "",
}: NewsImageSimpleProps) {
  const compactFallback =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23374151' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='12' font-family='system-ui'%3ENo Image%3C/text%3E%3C/svg%3E";

  const initialSrc = src && src.trim() !== "" ? src : compactFallback;
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(!src || src.trim() === "");

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(compactFallback);
    }
  };

  useEffect(() => {
    if (src && src.trim() !== "" && src !== imgSrc) {
      setImgSrc(src);
      setHasError(false);
    } else if (!src || src.trim() === "") {
      setImgSrc(compactFallback);
      setHasError(true);
    }
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt || "News image"}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
}

// Horizontal version
export function NewsImageHorizontalSimple({
  src,
  alt,
  className = "",
}: NewsImageSimpleProps) {
  const horizontalFallback =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Crect fill='%23374151' width='640' height='360'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='20' font-family='system-ui'%3ENo Image%3C/text%3E%3C/svg%3E";

  const initialSrc = src && src.trim() !== "" ? src : horizontalFallback;
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(!src || src.trim() === "");

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(horizontalFallback);
    }
  };

  useEffect(() => {
    if (src && src.trim() !== "" && src !== imgSrc) {
      setImgSrc(src);
      setHasError(false);
    } else if (!src || src.trim() === "") {
      setImgSrc(horizontalFallback);
      setHasError(true);
    }
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt || "News image"}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
}
