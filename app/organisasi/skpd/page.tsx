// app/organisasi/skpd/page.tsx

import { Suspense } from "react";
import {
  generatePublicMetadata,
  generateBreadcrumbStructuredData,
} from "@/lib/metadata-helpers";
import { getAllSKPD } from "@/lib/models/skpd.model";
import SKPDContent from "./_client";
import { Skeleton } from "@/components/ui/skeleton";

// Generate metadata untuk SEO
export async function generateMetadata() {
  // Fetch SKPD count untuk metadata
  const skpdData = await getAllSKPD();

  return generatePublicMetadata({
    title: "Daftar SKPD",
    description: `Direktori lengkap ${skpdData.length} Satuan Kerja Perangkat Daerah (SKPD) Kabupaten Merauke beserta informasi kontak, pejabat yang bertanggung jawab, alamat, telepon, email, dan website resmi setiap instansi.`,
    keywords: [
      "skpd merauke",
      "dinas merauke",
      "badan merauke",
      "pemerintah merauke",
      "satuan kerja perangkat daerah",
      "organisasi pemerintah merauke",
      "direktori skpd",
      "kontak skpd merauke",
    ],
    path: "/organisasi/skpd",
    type: "website",
  });
}

function SKPDSkeleton() {
  return (
    <main className="py-8 px-4 sm:px-8">
      <div className="container max-w-7xl">
        <Skeleton className="h-6 w-64 mb-6" />
        <div className="mb-8 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-24" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default async function SKPDPage() {
  // Fetch SKPD data from database
  const skpdData = await getAllSKPD();

  // Generate breadcrumb structured data
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "Beranda", url: "/" },
    { name: "Organisasi", url: "/organisasi" },
    { name: "Daftar SKPD", url: "/organisasi/skpd" },
  ]);

  // Generate Organization structured data for each SKPD
  const organizationsData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: skpdData.length,
    itemListElement: skpdData.slice(0, 10).map((skpd, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "GovernmentOrganization",
        name: skpd.nama,
        alternateName: skpd.singkatan,
        description: skpd.deskripsi || undefined,
        address: skpd.alamat
          ? {
              "@type": "PostalAddress",
              streetAddress: skpd.alamat,
              addressCountry: "ID",
            }
          : undefined,
        telephone: skpd.telepon || undefined,
        email: skpd.email || undefined,
        url: skpd.website || undefined,
        employee: skpd.kepala
          ? {
              "@type": "Person",
              name: skpd.kepala,
              jobTitle: "Kepala",
            }
          : undefined,
      },
    })),
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationsData) }}
      />

      <Suspense fallback={<SKPDSkeleton />}>
        <SKPDContent skpdData={skpdData} />
      </Suspense>
    </>
  );
}
