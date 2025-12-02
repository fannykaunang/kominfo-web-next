// app/page.tsx

import { Suspense } from "react";
import { NewsHero, NewsHeroSkeleton } from "@/components/berita/news-hero";
import { HomeSlider } from "@/components/home/home-slider";
import {
  NewsCard,
  NewsCardCompact,
  NewsCardSkeleton,
} from "@/components/berita/news-card";
import {
  StatsSection,
  StatsSectionSkeleton,
} from "@/components/home/stats-section";
import {
  CategorySection,
  CategorySectionSkeleton,
} from "@/components/home/category-section";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, TrendingUp } from "lucide-react";
import Link from "next/link";
import { BeritaRepository } from "@/lib/models/berita.model";
import { getAllKategori, getKategoriBySlug } from "@/lib/models/kategori.model";
import { SliderRepository } from "@/lib/models/slider.model";

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

    // Get popular berita (berdasarkan views)
    const popularResult = await BeritaRepository.getPopular(5);

    const [infoPentingKategori, infoMasyarakatKategori] = await Promise.all([
      getKategoriBySlug("informasi-penting"),
      getKategoriBySlug("informasi-masyarakat"),
    ]);

    const [
      infoPentingNewsResult,
      infoMasyarakatNewsResult,
      categories,
      sliders,
    ] = await Promise.all([
      infoPentingKategori
        ? BeritaRepository.findAll({
            kategori_id: infoPentingKategori.id,
            is_published: true,
            limit: 5,
          })
        : Promise.resolve({ data: [] }),
      infoMasyarakatKategori
        ? BeritaRepository.findAll({
            kategori_id: infoMasyarakatKategori.id,
            is_published: true,
            limit: 5,
          })
        : Promise.resolve({ data: [] }),
      getAllKategori(),
      SliderRepository.findAll({ is_published: true }),
    ]);

    return {
      highlightNews: highlightResult.data,
      latestNews: latestResult.data,
      popularNews: popularResult,
      infoPentingNews: infoPentingNewsResult.data,
      infoMasyarakatNews: infoMasyarakatNewsResult.data,
      categories,
      sliders,
    };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return {
      highlightNews: [],
      latestNews: [],
      popularNews: [],
      infoPentingNews: [],
      infoMasyarakatNews: [],
      categories: [],
      sliders: [],
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
  const {
    highlightNews,
    latestNews,
    popularNews,
    infoPentingNews,
    infoMasyarakatNews,
    categories,
    sliders,
  } = await getHomeData();

  // Prepare data for NewsHero component
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
  const transformedSliders = sliders?.map((slider) => ({
    id: slider.id,
    judul: slider.judul,
    deskripsi: slider.deskripsi,
    image: slider.image || "/images/placeholder.png",
  }));

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

  // Transform popular news for dedicated section
  const transformedPopularNews = popularNews.map((berita) => ({
    id: berita.id,
    judul: berita.judul,
    slug: berita.slug,
    featuredImage: berita.featured_image || "/images/placeholder.png",
    kategori: {
      nama: berita.kategori_nama || "Umum",
      slug: berita.kategori_slug || "umum",
      color: berita.kategori_color || "#3b82f6",
    },
    publishedAt: berita.published_at
      ? new Date(berita.published_at).toISOString()
      : new Date(berita.created_at).toISOString(),
  }));

  const transformCompactNews = (items: typeof popularNews) =>
    items.map((berita) => ({
      id: berita.id,
      judul: berita.judul,
      slug: berita.slug,
      featuredImage: berita.featured_image || "/images/placeholder.png",
      kategori: {
        nama: berita.kategori_nama || "Umum",
        slug: berita.kategori_slug || "umum",
        color: berita.kategori_color || "#3b82f6",
      },
      publishedAt: berita.published_at
        ? new Date(berita.published_at).toISOString()
        : new Date(berita.created_at).toISOString(),
    }));

  const transformedInfoPentingNews = transformCompactNews(infoPentingNews);
  const transformedInfoMasyarakatNews =
    transformCompactNews(infoMasyarakatNews);

  // Transform categories for CategorySection
  const transformedCategories = categories.map((kategori) => ({
    id: kategori.id,
    nama: kategori.nama,
    slug: kategori.slug,
    icon: kategori.icon || "folder",
    color: kategori.color || "#3b82f6",
    _count: { berita: kategori.berita_count || 0 },
  }));

  return (
    <main className="min-h-screen" suppressHydrationWarning>
      {/* Hero Section with Main News */}
      <Suspense fallback={<NewsHeroSkeleton />}>
        <HomeSlider sliders={transformedSliders} sideNews={sideNews} />
      </Suspense>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
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
                <div className="col-span-full text-center py-12 text-muted-foreground">
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

      {/* Popular News Section */}
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-2 mb-6">
            <Eye className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold">Berita Populer</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Terpopuler</h4>
                <Button variant="outline" asChild>
                  <Link
                    href="/berita"
                    className="text-sm text-primary inline-flex items-center gap-1">
                    Lihat semua
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-4">
                {transformedPopularNews.length > 0 ? (
                  transformedPopularNews.map(({ id, ...news }) => (
                    <NewsCardCompact key={id} {...news} />
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    Belum ada berita populer
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Informasi Penting</h4>
                <Button variant="outline" asChild>
                  <Link
                    href="/kategori/informasi-penting"
                    className="text-sm text-primary inline-flex items-center gap-1">
                    Lihat semua
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-4">
                {transformedInfoPentingNews.length > 0 ? (
                  transformedInfoPentingNews.map(({ id, ...news }) => (
                    <NewsCardCompact key={id} {...news} />
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    Belum ada informasi penting
                  </p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Informasi Masyarakat</h4>
                <Button variant="outline" asChild>
                  <Link
                    href="/kategori/informasi-masyarakat"
                    className="text-sm text-primary inline-flex items-center gap-1">
                    Lihat semua
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-4">
                {transformedInfoMasyarakatNews.length > 0 ? (
                  transformedInfoMasyarakatNews.map(({ id, ...news }) => (
                    <NewsCardCompact key={id} {...news} />
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    Belum ada informasi masyarakat
                  </p>
                )}
              </div>
            </div>
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
