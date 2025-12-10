// app/galeri/video/page.tsx

import { Suspense } from "react";
import { generatePublicMetadata } from "@/lib/metadata-helpers";
import GaleriVideoClient from "./_client";
import { Skeleton } from "@/components/ui/skeleton";

// Generate metadata untuk SEO
export async function generateMetadata() {
  return generatePublicMetadata({
    title: "Galeri Video",
    description:
      "Koleksi video dokumentasi kegiatan dan acara Kabupaten Merauke. Saksikan berbagai liputan kegiatan pemerintah, acara resmi, dan kehidupan masyarakat Merauke.",
    keywords: [
      "galeri video merauke",
      "video dokumentasi merauke",
      "video kegiatan merauke",
      "youtube merauke",
      "video pemerintah merauke",
      "liputan merauke",
      "dokumentasi video",
    ],
    path: "/galeri/video",
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GaleriVideoPage() {
  return (
    <Suspense fallback={<GaleriSkeleton />}>
      <GaleriVideoClient />
    </Suspense>
  );
}
