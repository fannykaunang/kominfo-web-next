// components/berita/news-img-simple.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";

interface NewsImageSimpleProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
}

// Light theme fallback
const LIGHT_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect fill='%23e5e7eb' width='800' height='450'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='24' font-family='system-ui'%3ENo Image%3C/text%3E%3C/svg%3E";

// Dark theme fallback
const DARK_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect fill='%23374151' width='800' height='450'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='24' font-family='system-ui'%3ENo Image%3C/text%3E%3C/svg%3E";

export function NewsImageSimple({
  src,
  alt,
  className = "",
}: NewsImageSimpleProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Get appropriate fallback based on theme
  const getFallback = () => {
    return theme === "dark" ? DARK_FALLBACK : LIGHT_FALLBACK;
  };

  // If no src, use fallback immediately
  const initialSrc = src && src.trim() !== "" ? src : getFallback();
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(!src || src.trim() === "");
  const imgRef = useRef<HTMLImageElement>(null);

  // Set mounted flag
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle image error
  const handleError = () => {
    console.log("Image failed to load:", src);
    if (!hasError) {
      setHasError(true);
      setImgSrc(getFallback());
    }
  };

  // Handle successful load
  const handleLoad = () => {
    console.log("Image loaded successfully:", src);
  };

  // Update fallback when theme changes
  useEffect(() => {
    if (hasError || !src || src.trim() === "") {
      setImgSrc(getFallback());
    }
  }, [theme, hasError, src]);

  // Check if image src changed
  useEffect(() => {
    if (src && src.trim() !== "" && src !== imgSrc && !hasError) {
      setImgSrc(src);
      setHasError(false);
    } else if (!src || src.trim() === "") {
      setImgSrc(getFallback());
      setHasError(true);
    }
  }, [src]);

  // Show placeholder while mounting to prevent hydration mismatch
  if (!mounted) {
    return (
      <img
        src={LIGHT_FALLBACK}
        alt={alt || "News image"}
        className={className}
        loading="lazy"
      />
    );
  }

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
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Light theme compact fallback
  const LIGHT_COMPACT =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='12' font-family='system-ui'%3ENo Image%3C/text%3E%3C/svg%3E";

  // Dark theme compact fallback
  const DARK_COMPACT =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23374151' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='12' font-family='system-ui'%3ENo Image%3C/text%3E%3C/svg%3E";

  const getFallback = () => {
    return theme === "dark" ? DARK_COMPACT : LIGHT_COMPACT;
  };

  const initialSrc = src && src.trim() !== "" ? src : getFallback();
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(!src || src.trim() === "");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(getFallback());
    }
  };

  useEffect(() => {
    if (hasError || !src || src.trim() === "") {
      setImgSrc(getFallback());
    }
  }, [theme, hasError, src]);

  useEffect(() => {
    if (src && src.trim() !== "" && src !== imgSrc && !hasError) {
      setImgSrc(src);
      setHasError(false);
    } else if (!src || src.trim() === "") {
      setImgSrc(getFallback());
      setHasError(true);
    }
  }, [src]);

  if (!mounted) {
    return (
      <img
        src={LIGHT_COMPACT}
        alt={alt || "News image"}
        className={className}
        loading="lazy"
      />
    );
  }

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
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Light theme horizontal fallback
  const LIGHT_HORIZONTAL =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Crect fill='%23e5e7eb' width='640' height='360'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-size='20' font-family='system-ui'%3ENo Image%3C/text%3E%3C/svg%3E";

  // Dark theme horizontal fallback
  const DARK_HORIZONTAL =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Crect fill='%23374151' width='640' height='360'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='20' font-family='system-ui'%3ENo Image%3C/text%3E%3C/svg%3E";

  const getFallback = () => {
    return theme === "dark" ? DARK_HORIZONTAL : LIGHT_HORIZONTAL;
  };

  const initialSrc = src && src.trim() !== "" ? src : getFallback();
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(!src || src.trim() === "");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(getFallback());
    }
  };

  useEffect(() => {
    if (hasError || !src || src.trim() === "") {
      setImgSrc(getFallback());
    }
  }, [theme, hasError, src]);

  useEffect(() => {
    if (src && src.trim() !== "" && src !== imgSrc && !hasError) {
      setImgSrc(src);
      setHasError(false);
    } else if (!src || src.trim() === "") {
      setImgSrc(getFallback());
      setHasError(true);
    }
  }, [src]);

  if (!mounted) {
    return (
      <img
        src={LIGHT_HORIZONTAL}
        alt={alt || "News image"}
        className={className}
        loading="lazy"
      />
    );
  }

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
