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

// Mock data - In production, fetch from API/database
const mockMainNews = {
  id: "1",
  judul: "Pembangunan Jalan Trans Papua Merauke Dipercepat",
  slug: "pembangunan-jalan-trans-papua-merauke-dipercepat",
  excerpt:
    "Pemerintah Kabupaten Merauke mempercepat pembangunan infrastruktur jalan Trans Papua untuk meningkatkan konektivitas dan aksesibilitas wilayah.",
  featuredImage: "/images/news-1.jpg",
  kategori: {
    nama: "Pembangunan",
    slug: "pembangunan",
    color: "#f59e0b",
  },
  publishedAt: new Date().toISOString(),
  views: 1250,
};

const mockSideNews = [
  {
    id: "2",
    judul: "Bupati Merauke Resmikan Pasar Modern di Kelapa Lima",
    slug: "bupati-merauke-resmikan-pasar-modern",
    excerpt:
      "Pasar modern dengan fasilitas lengkap untuk mendukung ekonomi masyarakat",
    featuredImage: "/images/news-2.jpg",
    kategori: { nama: "Ekonomi", slug: "ekonomi", color: "#10b981" },
    publishedAt: new Date().toISOString(),
    views: 850,
  },
  {
    id: "3",
    judul: "Festival Budaya Merauke 2024 Digelar Meriah",
    slug: "festival-budaya-merauke-2024",
    excerpt: "Menampilkan berbagai kesenian dan budaya khas Papua Selatan",
    featuredImage: "/images/news-3.jpg",
    kategori: { nama: "Budaya", slug: "budaya", color: "#8b5cf6" },
    publishedAt: new Date().toISOString(),
    views: 720,
  },
];

const mockLatestNews = [
  {
    id: "4",
    judul: "Program Bantuan Sosial untuk Masyarakat Terdampak Banjir",
    slug: "program-bantuan-sosial-banjir",
    excerpt:
      "Pemkab Merauke menyalurkan bantuan sosial kepada masyarakat yang terdampak banjir di beberapa wilayah.",
    featuredImage: "/images/news-4.jpg",
    kategori: { nama: "Sosial", slug: "sosial", color: "#ec4899" },
    author: { name: "Admin Portal" },
    publishedAt: new Date().toISOString(),
    views: 980,
  },
  {
    id: "5",
    judul: "Peningkatan Kualitas Pendidikan di Kabupaten Merauke",
    slug: "peningkatan-kualitas-pendidikan",
    excerpt:
      "Pemerintah daerah fokus pada peningkatan kualitas pendidikan melalui berbagai program strategis.",
    featuredImage: "/images/news-5.jpg",
    kategori: { nama: "Pendidikan", slug: "pendidikan", color: "#3b82f6" },
    author: { name: "Redaksi" },
    publishedAt: new Date().toISOString(),
    views: 1120,
  },
  {
    id: "6",
    judul: "Puskesmas Baru Dibangun di Distrik Terpencil",
    slug: "puskesmas-baru-distrik-terpencil",
    excerpt:
      "Upaya meningkatkan akses layanan kesehatan bagi masyarakat di daerah terpencil.",
    featuredImage: "/images/news-6.jpg",
    kategori: { nama: "Kesehatan", slug: "kesehatan", color: "#14b8a6" },
    author: { name: "Admin Portal" },
    publishedAt: new Date().toISOString(),
    views: 890,
  },
  {
    id: "7",
    judul: "UMKM Merauke Raih Penghargaan Nasional",
    slug: "umkm-merauke-penghargaan-nasional",
    excerpt:
      "Produk UMKM dari Merauke berhasil meraih penghargaan di tingkat nasional.",
    featuredImage: "/images/news-7.jpg",
    kategori: { nama: "UMKM", slug: "umkm", color: "#f59e0b" },
    author: { name: "Redaksi" },
    publishedAt: new Date().toISOString(),
    views: 760,
  },
];

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

const mockCategories = [
  {
    id: "1",
    nama: "Pemerintahan",
    slug: "pemerintahan",
    icon: "building",
    color: "#3b82f6",
    _count: { berita: 45 },
  },
  {
    id: "2",
    nama: "Pembangunan",
    slug: "pembangunan",
    icon: "hammer",
    color: "#f59e0b",
    _count: { berita: 38 },
  },
  {
    id: "3",
    nama: "Pendidikan",
    slug: "pendidikan",
    icon: "graduation",
    color: "#8b5cf6",
    _count: { berita: 32 },
  },
  {
    id: "4",
    nama: "Kesehatan",
    slug: "kesehatan",
    icon: "heart",
    color: "#14b8a6",
    _count: { berita: 28 },
  },
  {
    id: "5",
    nama: "UMKM",
    slug: "umkm",
    icon: "store",
    color: "#10b981",
    _count: { berita: 24 },
  },
  {
    id: "6",
    nama: "Pariwisata",
    slug: "pariwisata",
    icon: "palmtree",
    color: "#06b6d4",
    _count: { berita: 21 },
  },
  {
    id: "7",
    nama: "Budaya",
    slug: "budaya",
    icon: "music",
    color: "#ec4899",
    _count: { berita: 19 },
  },
  {
    id: "8",
    nama: "Sosial",
    slug: "sosial",
    icon: "heart",
    color: "#ef4444",
    _count: { berita: 16 },
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with Main News */}
      <Suspense fallback={<NewsHeroSkeleton />}>
        <NewsHero mainNews={mockMainNews} sideNews={mockSideNews} />
      </Suspense>

      {/* Stats Section */}
      <Suspense fallback={<StatsSectionSkeleton />}>
        <StatsSection stats={mockStats} />
      </Suspense>

      {/* Latest News Section */}
      <section className="py-16">
        <div className="container">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Suspense
              fallback={
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <NewsCardSkeleton key={i} />
                  ))}
                </>
              }>
              {mockLatestNews.map((news) => (
                <NewsCard key={news.id} {...news} />
              ))}
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
        <CategorySection categories={mockCategories} />
      </Suspense>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-hero text-white">
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
              className="text-white border-white hover:bg-white hover:text-primary"
              asChild>
              <Link href="/kontak">Hubungi Kami</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
