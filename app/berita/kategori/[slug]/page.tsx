// app/berita/kategori/[slug]/page.tsx

import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Tag, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewsCard, NewsCardCompact } from "@/components/berita/news-card";
import { BeritaRepository } from "@/lib/models/berita.model";
import {
  getKategoriBySlug,
  getAllKategoriByNewsPublished,
} from "@/lib/models/kategori.model";
import {
  generateCategoryMetadata,
  generateBreadcrumbStructuredData,
} from "@/lib/metadata-helpers";

interface KategoriPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function KategoriPage({
  params,
  searchParams,
}: KategoriPageProps) {
  // Await params
  const { slug } = await params;
  const { page = "1" } = await searchParams;

  // Get kategori by slug
  const kategori = await getKategoriBySlug(slug);

  if (!kategori) {
    notFound();
  }

  // Get berita with pagination
  const currentPage = parseInt(page);
  const limit = 12; // 12 berita per halaman

  const result = await BeritaRepository.findAll({
    page: currentPage,
    limit,
    kategori_id: kategori.id,
    is_published: true,
  });

  const { data: beritaList, pagination } = result;

  // Get all kategori for sidebar
  const allKategori = await getAllKategoriByNewsPublished();

  // Get popular news
  const popularNews = await BeritaRepository.getPopular(5);

  // Generate breadcrumb structured data
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "Beranda", url: "/" },
    { name: "Berita", url: "/berita" },
    { name: "Kategori", url: "/berita/kategori" },
    { name: kategori.nama, url: `/berita/kategori/${slug}` },
  ]);

  // Generate page numbers
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
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />

      <main className="py-8 px-4 sm:px-8">
        <div className="container">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge
                className="text-lg px-4 py-2"
                style={{ backgroundColor: kategori.color || "#3b82f6" }}
              >
                <Tag className="h-5 w-5 mr-2" />
                {kategori.nama}
              </Badge>
            </div>
            {kategori.deskripsi && (
              <p className="text-muted-foreground text-lg">
                {kategori.deskripsi
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </p>
            )}
            <div className="mt-2 text-sm text-muted-foreground">
              Menampilkan {beritaList.length} dari {pagination.total} berita
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Berita Grid */}
              {beritaList.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    {beritaList.map((berita) => (
                      <NewsCard
                        key={berita.id}
                        id={berita.id}
                        judul={berita.judul}
                        slug={berita.slug}
                        excerpt={berita.excerpt}
                        featuredImage={
                          berita.featured_image ||
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect fill='%23e5e7eb' width='800' height='450'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='24' font-family='system-ui'%3ENo Image%3C/text%3E%3C/svg%3E"
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
                    <div className="flex items-center justify-center gap-2 mt-8">
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
                            href={`/berita/kategori/${slug}?page=${
                              currentPage - 1
                            }`}
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
                                  pageNum === currentPage
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="min-w-[40px]"
                                asChild
                              >
                                <Link
                                  href={`/berita/kategori/${slug}?page=${pageNum}`}
                                >
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
                            href={`/berita/kategori/${slug}?page=${
                              currentPage + 1
                            }`}
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
                    <Tag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      Belum Ada Berita
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Kategori ini belum memiliki berita yang dipublikasikan.
                    </p>
                    <Button asChild>
                      <Link href="/berita">Lihat Semua Berita</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* List Kategori */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Kategori Berita
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {allKategori.map((kat) => (
                    <Link
                      key={kat.id}
                      href={`/berita/kategori/${kat.slug}`}
                      className={`group flex items-center justify-between p-3 rounded-lg transition-colors ${
                        kat.id === kategori.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-1 h-8 rounded-full"
                          style={{ backgroundColor: kat.color || "#3b82f6" }}
                        />
                        <div>
                          <div className="font-medium">{kat.nama}</div>
                          {kat.berita_count !== undefined && (
                            <div className="text-xs text-muted-foreground">
                              {kat.berita_count} berita
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Berita Populer */}
              {popularNews.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Berita Populer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {popularNews.map((news) => (
                      <NewsCardCompact
                        key={news.id}
                        judul={news.judul}
                        slug={news.slug}
                        featuredImage={
                          news.featured_image ||
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect fill='%23e5e7eb' width='800' height='450'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='24' font-family='system-ui'%3ENo Image%3C/text%3E%3C/svg%3E"
                        }
                        kategori={{
                          nama: news.kategori_nama || "Umum",
                          slug: news.kategori_slug || "umum",
                          color: news.kategori_color || "#3b82f6",
                        }}
                        publishedAt={
                          news.published_at
                            ? new Date(news.published_at).toISOString()
                            : new Date(news.created_at).toISOString()
                        }
                      />
                    ))}
                  </CardContent>
                </Card>
              )}
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

// Generate metadata for SEO dengan helper
export async function generateMetadata({ params }: KategoriPageProps) {
  const { slug } = await params;
  const kategori = await getKategoriBySlug(slug);

  if (!kategori) {
    return {
      title: "Kategori Tidak Ditemukan",
    };
  }

  // Hitung total berita untuk kategori ini
  const result = await BeritaRepository.findAll({
    page: 1,
    limit: 1,
    kategori_id: kategori.id,
    is_published: true,
  });

  return generateCategoryMetadata({
    name: kategori.nama,
    description: kategori.deskripsi || undefined,
    slug: slug,
    count: result.pagination.total,
  });
}
