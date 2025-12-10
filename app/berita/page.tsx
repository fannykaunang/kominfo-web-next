// app/berita/page.tsx

import { ChevronLeft, ChevronRight, Newspaper } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NewsCard } from "@/components/berita/news-card";
import { BeritaRepository } from "@/lib/models/berita.model";

interface BeritaPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function BeritaPage({ searchParams }: BeritaPageProps) {
  // Await searchParams
  const { page = "1" } = await searchParams;

  // Get all published berita with pagination
  const currentPage = parseInt(page);
  const limit = 16; // 16 berita per halaman (4x4 grid)

  const result = await BeritaRepository.findAll({
    page: currentPage,
    limit,
    is_published: true,
  });

  const { data: beritaList, pagination } = result;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    const totalPages = pagination.totalPages;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <main className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Newspaper className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Berita Terkini</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Informasi dan berita terbaru dari Kabupaten Merauke
          </p>
          <div className="mt-2 text-sm text-muted-foreground">
            Menampilkan {beritaList.length} dari {pagination.total} berita
          </div>
        </div>

        {/* Berita Grid */}
        {beritaList.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {beritaList.map((berita) => (
                <NewsCard
                  key={berita.id}
                  id={berita.id}
                  judul={berita.judul}
                  slug={berita.slug}
                  excerpt={berita.excerpt}
                  featuredImage={
                    berita.featured_image || "/images/placeholder.jpg"
                  }
                  kategori={{
                    nama: berita.kategori_nama || "Umum",
                    slug: berita.kategori_slug || "umum",
                    color: berita.kategori_color || "#3b82f6",
                  }}
                  author={{
                    name: berita.author_name || "Admin",
                    avatar: berita.avatar,
                  }}
                  publishedAt={
                    berita.published_at
                      ? new Date(berita.published_at).toISOString()
                      : new Date(berita.created_at).toISOString()
                  }
                  views={berita.views || 0}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {/* Previous Button */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  asChild={currentPage !== 1}
                >
                  {currentPage === 1 ? (
                    <span className="inline-flex items-center cursor-not-allowed">
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Sebelumnya
                    </span>
                  ) : (
                    <Link
                      href={`/berita?page=${currentPage - 1}`}
                      className="inline-flex items-center"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Sebelumnya
                    </Link>
                  )}
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum, index) => (
                    <div key={index}>
                      {typeof pageNum === "string" ? (
                        <span className="px-3 py-2 text-muted-foreground">
                          {pageNum}
                        </span>
                      ) : (
                        <Button
                          variant={
                            pageNum === currentPage ? "default" : "outline"
                          }
                          size="sm"
                          className="min-w-[40px]"
                          asChild
                        >
                          <Link href={`/berita?page=${pageNum}`}>
                            {pageNum}
                          </Link>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Next Button */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === pagination.totalPages}
                  asChild={currentPage !== pagination.totalPages}
                >
                  {currentPage === pagination.totalPages ? (
                    <span className="inline-flex items-center cursor-not-allowed">
                      Selanjutnya
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </span>
                  ) : (
                    <Link
                      href={`/berita?page=${currentPage + 1}`}
                      className="inline-flex items-center"
                    >
                      Selanjutnya
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Newspaper className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Berita</h3>
              <p className="text-muted-foreground mb-4">
                Belum ada berita yang dipublikasikan saat ini.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Additional Info */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            Berita diperbarui setiap hari. Kunjungi halaman ini secara berkala
            untuk mendapatkan informasi terbaru dari Kabupaten Merauke.
          </p>
        </div>
      </div>
    </main>
  );
}

// Generate metadata for SEO
export async function generateMetadata() {
  // Get latest berita for description
  const result = await BeritaRepository.findAll({
    page: 1,
    limit: 5,
    is_published: true,
  });

  const latestTitles = result.data
    .map((b) => b.judul)
    .slice(0, 3)
    .join(", ");

  return {
    title: "Berita Terkini - Portal Berita Kabupaten Merauke",
    description: `Informasi dan berita terbaru dari Kabupaten Merauke. ${latestTitles}. Dapatkan update berita terkini setiap hari.`,
    keywords: [
      "berita merauke",
      "informasi merauke",
      "kabupaten merauke",
      "berita papua",
      "berita terkini",
      "portal berita merauke",
    ],
    openGraph: {
      title: "Berita Terkini - Portal Berita Kabupaten Merauke",
      description: `Informasi dan berita terbaru dari Kabupaten Merauke. Dapatkan update berita terkini setiap hari.`,
      type: "website",
      url: "/berita",
      siteName: "Portal Berita Kabupaten Merauke",
    },
    twitter: {
      card: "summary_large_image",
      title: "Berita Terkini - Portal Berita Kabupaten Merauke",
      description: `Informasi dan berita terbaru dari Kabupaten Merauke. Dapatkan update berita terkini setiap hari.`,
    },
    alternates: {
      canonical: "/berita",
    },
  };
}
