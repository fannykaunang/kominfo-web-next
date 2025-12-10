// app/hubungi-kami/page.tsx

import { Suspense } from "react";
import {
  generatePublicMetadata,
  generateBreadcrumbStructuredData,
} from "@/lib/metadata-helpers";
import { getAppSettings } from "@/lib/models/settings.model";
import HubungiKamiClient from "./_client";
import { Skeleton } from "@/components/ui/skeleton";

// Generate metadata untuk SEO
export async function generateMetadata() {
  return generatePublicMetadata({
    title: "Hubungi Kami",
    description:
      "Hubungi Pemerintah Kabupaten Merauke untuk informasi, pertanyaan, atau layanan publik. Kami siap membantu Anda melalui berbagai saluran komunikasi yang tersedia.",
    keywords: [
      "hubungi merauke",
      "kontak merauke",
      "alamat pemkab merauke",
      "email merauke",
      "telepon merauke",
      "layanan publik merauke",
      "kantor pemkab merauke",
    ],
    path: "/hubungi-kami",
    type: "website",
  });
}

function HubungiKamiSkeleton() {
  return (
    <main className="py-8 px-4 sm:px-8">
      <div className="container max-w-7xl">
        <Skeleton className="h-6 w-64 mb-6" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-96" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default async function HubungiKamiPage() {
  // Fetch settings dari database
  const settings = await getAppSettings();

  // Generate breadcrumb structured data
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "Beranda", url: "/" },
    { name: "Hubungi Kami", url: "/hubungi-kami" },
  ]);

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />

      <Suspense fallback={<HubungiKamiSkeleton />}>
        <HubungiKamiClient settings={settings} />
      </Suspense>
    </>
  );
}
