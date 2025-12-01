// app/page.tsx

import { Suspense } from "react";
import { NewsHero, NewsHeroSkeleton } from "@/components/berita/news-hero";
import { NewsCard, NewsCardSkeleton } from "@/components/berita/news-card";
import {
  StatsSection,
  StatsSectionSkeleton,
} from "@/components/home/stats-section";
import {
  CategorySection,
  CategorySectionSkeleton,
} from "@/components/home/category-section";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { BeritaRepository } from "@/lib/models/berita.model";
import { getAllKategori } from "@/lib/models/kategori.model";

// Fetch real data from database
async function getHomeData() {
  try {
    // Get berita highlight (untuk hero)
    const highlightResult = await BeritaRepository.findAll({
      is_published: true,
      is_highlight: true,
      limit: 4,
    });

    // Get latest berita (untuk berita terkini)
    const latestResult = await BeritaRepository.findAll({
      is_published: true,
      limit: 4,
    });

    // Get all categories
    const categories = await getAllKategori();

    return {
      highlightNews: highlightResult.data,
      latestNews: latestResult.data,
      categories,
    };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return {
      highlightNews: [],
      latestNews: [],
      categories: [],
    };
  }
}

// Mock stats - replace with real data when available
const mockStats = [
  {
    id: "1",
    judul: "Jumlah Penduduk",
    nilai: "234,617",
    satuan: "jiwa",
    icon: "users",
    kategori: "demografi",
  },
  {
    id: "2",
    judul: "Luas Wilayah",
    nilai: "46,791",
    satuan: "km²",
    icon: "building",
    kategori: "geografis",
  },
  {
    id: "3",
    judul: "UMKM Aktif",
    nilai: "3,456",
    satuan: "unit",
    icon: "briefcase",
    kategori: "ekonomi",
  },
  {
    id: "4",
    judul: "Pertumbuhan Ekonomi",
    nilai: "5.2",
    satuan: "%",
    icon: "trending",
    kategori: "ekonomi",
  },
];

export default async function HomePage() {
  const { highlightNews, latestNews, categories } = await getHomeData();

  // Prepare data for NewsHero component
  const mainNews = highlightNews[0] || null;
  const sideNews = highlightNews.slice(1, 4).map((berita) => ({
    id: berita.id,
    judul: berita.judul,
    slug: berita.slug,
    excerpt: berita.excerpt,
    featuredImage: berita.featured_image || "/images/placeholder.png",
    kategori: {
      nama: berita.kategori_nama || "Umum",
      slug: berita.kategori_slug || "umum",
      color: berita.kategori_color || "#3b82f6",
    },
    publishedAt: berita.published_at
      ? new Date(berita.published_at).toISOString()
      : new Date(berita.created_at).toISOString(),
    views: berita.views || 0,
  }));

  // Transform mainNews for NewsHero
  const transformedMainNews = mainNews
    ? {
        id: mainNews.id,
        judul: mainNews.judul,
        slug: mainNews.slug,
        excerpt: mainNews.excerpt,
        featuredImage: mainNews.featured_image || "/images/placeholder.png",
        kategori: {
          nama: mainNews.kategori_nama || "Umum",
          slug: mainNews.kategori_slug || "umum",
          color: mainNews.kategori_color || "#3b82f6",
        },
        publishedAt: mainNews.published_at
          ? new Date(mainNews.published_at).toISOString()
          : new Date(mainNews.created_at).toISOString(),
        views: mainNews.views || 0,
      }
    : null;

  // Transform latest news for NewsCard
  const transformedLatestNews = latestNews.map((berita) => ({
    id: berita.id,
    judul: berita.judul,
    slug: berita.slug,
    excerpt: berita.excerpt,
    featuredImage: berita.featured_image || "/images/placeholder.png",
    kategori: {
      nama: berita.kategori_nama || "Umum",
      slug: berita.kategori_slug || "umum",
      color: berita.kategori_color || "#3b82f6",
    },
    author: {
      name: berita.author_name || "Admin",
    },
    publishedAt: berita.published_at
      ? new Date(berita.published_at).toISOString()
      : new Date(berita.created_at).toISOString(),
    views: berita.views || 0,
  }));

  // Transform categories for CategorySection
  const transformedCategories = categories.map((kategori) => ({
    id: kategori.id,
    nama: kategori.nama,
    slug: kategori.slug,
    icon: kategori.icon || "folder",
    color: kategori.color || "#3b82f6",
    _count: { berita: kategori.berita_count || 0 },
  }));

  // Check if we have highlight news
  const hasHighlightNews = transformedMainNews !== null;

  return (
    <main className="min-h-screen" suppressHydrationWarning>
      {/* Hero Section with Main News */}
      {hasHighlightNews ? (
        <Suspense fallback={<NewsHeroSkeleton />}>
          <NewsHero mainNews={transformedMainNews} sideNews={sideNews} />
        </Suspense>
      ) : (
        <section className="container py-16">
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-muted-foreground text-lg">
              Belum ada berita unggulan. Tandai berita sebagai highlight untuk
              menampilkannya di sini.
            </p>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <StatsSection stats={mockStats} />

      {/* Latest News Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-10 max-w-7xl mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">Berita Terkini</h2>
              </div>
              <p className="text-muted-foreground">
                Informasi terbaru dari Kabupaten Merauke
              </p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link href="/berita">
                Lihat Semua
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Suspense
              fallback={
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <NewsCardSkeleton key={i} />
                  ))}
                </>
              }>
              {transformedLatestNews.length > 0 ? (
                transformedLatestNews.map((news) => (
                  <NewsCard key={news.id} {...news} />
                ))
              ) : (
                <div className="col-span-4 text-center py-12 text-muted-foreground">
                  Belum ada berita tersedia
                </div>
              )}
            </Suspense>
          </div>

          {/* Mobile View All Button */}
          <div className="mt-8 md:hidden">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/berita">
                Lihat Semua Berita
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <Suspense fallback={<CategorySectionSkeleton />}>
        {transformedCategories.length > 0 && (
          <CategorySection categories={transformedCategories} />
        )}
      </Suspense>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-hero text-white max-w-7xl mx-auto px-4 sm:px-0">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ikuti Perkembangan Kabupaten Merauke
          </h2>
          <p className="text-slate-200 mb-8 max-w-2xl mx-auto">
            Dapatkan informasi terbaru tentang program pemerintah, pembangunan,
            dan berbagai kegiatan di Kabupaten Merauke
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/tentang">Tentang Kami</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-500"
              asChild>
              <Link href="/kontak">Hubungi Kami</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
