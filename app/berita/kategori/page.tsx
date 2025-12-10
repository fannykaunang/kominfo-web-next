// app/berita/kategori/page.tsx

import { getAllKategoriWithBeritaCount } from "@/lib/models/kategori.model";
import { CategorySection } from "@/components/home/category-section";
import {
  generatePublicMetadata,
  generateBreadcrumbStructuredData,
} from "@/lib/metadata-helpers";

// Generate metadata dengan helper
export async function generateMetadata() {
  return generatePublicMetadata({
    title: "Kategori Berita",
    description:
      "Jelajahi berita berdasarkan kategori. Temukan berita terbaru dari berbagai kategori seperti Info Pemilu, Info Penting, Wisata, SKPD, dan lainnya.",
    keywords: [
      "kategori berita",
      "berita merauke",
      "kategori",
      "topik berita",
      "portal berita",
    ],
    path: "/berita/kategori",
    type: "website",
  });
}

export default async function KategoriBeritaPage() {
  // Fetch all kategori with berita count
  const kategoriList = await getAllKategoriWithBeritaCount();

  // Generate breadcrumb structured data
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "Beranda", url: "/" },
    { name: "Berita", url: "/berita" },
    { name: "Kategori", url: "/berita/kategori" },
  ]);

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />

      <div className="min-h-screen">
        {/* Use existing CategorySection component with framer-motion */}
        <CategorySection categories={kategoriList} />
      </div>
    </>
  );
}
