// app/galeri/foto/page.tsx

import { Suspense } from "react";
import { generatePublicMetadata } from "@/lib/metadata-helpers";
import GaleriFotoClient from "./_client";
import { Skeleton } from "@/components/ui/skeleton";

// Generate metadata untuk SEO
export async function generateMetadata() {
  return generatePublicMetadata({
    title: "Galeri Foto",
    description:
      "Dokumentasi kegiatan dan momen penting Kabupaten Merauke dalam gambar. Jelajahi koleksi foto kegiatan pemerintah, acara, dan kehidupan masyarakat Merauke.",
    keywords: [
      "galeri foto merauke",
      "dokumentasi merauke",
      "foto kegiatan merauke",
      "galeri pemerintah merauke",
      "album foto merauke",
      "dokumentasi kegiatan",
      "foto resmi merauke",
    ],
    path: "/galeri/foto",
    type: "website",
  });
}

function GaleriSkeleton() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GaleriFotoPage() {
  return (
    <Suspense fallback={<GaleriSkeleton />}>
      <GaleriFotoClient />
    </Suspense>
  );
}
