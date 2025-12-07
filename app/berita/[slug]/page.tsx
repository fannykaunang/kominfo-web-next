// app/berita/[slug]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Eye, Clock, Share2, Tag } from "lucide-react";
import { SiFacebook, SiX, SiWhatsapp } from "react-icons/si";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { NewsCardCompact } from "@/components/berita/news-card";
import { BeritaRepository } from "@/lib/models/berita.model";
import GalleryLightbox from "@/components/berita/gallery-lightbox";
import { NewsImage } from "../../../components/berita/news-image";

interface NewsDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  // Await params in Next.js 15
  const { slug } = await params;

  // Fetch berita from database
  const berita = await BeritaRepository.findBySlug(slug);

  const beritaWithTags = berita as typeof berita & {
    tags?: { id: string; nama: string; slug: string }[];
  };

  if (!berita) {
    notFound();
  }

  // Increment views
  await BeritaRepository.incrementViews(berita.id);

  // Fetch related news
  const relatedNews = await BeritaRepository.getRelated(
    berita.kategori_id,
    berita.id,
    3
  );

  // Fetch popular news
  const popularNews = await BeritaRepository.getPopular(3);

  // Calculate reading time
  const readingTime = calculateReadingTime(berita.konten);

  // Current URL for sharing
  const currentUrl = `${
    process.env.NEXT_PUBLIC_SITE_URL || "https://portal.merauke.go.id"
  }/berita/${slug}`;

  // Parse galeri if exists
  const galeri = berita.galeri ? JSON.parse(berita.galeri as any) : [];

  return (
    <main className="py-8 px-8 sm:px-8">
      <div className="container">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-2">
            {/* Category Badge */}
            <Badge
              className="mb-4"
              style={{ backgroundColor: berita.kategori_color || "#3b82f6" }}
            >
              {berita.kategori_nama}
            </Badge>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              {berita.judul}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {/* kalau avatar ada, coba tampilkan gambar */}
                  {berita.avatar && (
                    <AvatarImage src={berita.avatar} alt={berita.author_name} />
                  )}

                  {/* kalau src kosong / error, yang ini akan tampil */}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {berita.author_name?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>

                <span className="font-medium">
                  {berita.author_name || "Admin"}
                </span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(
                    berita.published_at || berita.created_at
                  ).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{(berita.views || 0).toLocaleString()} views</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{readingTime} menit baca</span>
              </div>
            </div>

            {/* Featured Image */}
            {berita.featured_image && (
              <div className="relative aspect-video mb-8 rounded-xl overflow-hidden">
                <NewsImage
                  src={berita.featured_image}
                  alt={berita.judul}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            )}

            {/* Share Buttons */}
            <Card className="mb-8 border-0 shadow-lg bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Share2 className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Bagikan:</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0 hover:bg-[#1877f2] hover:text-white"
                      asChild
                    >
                      <a
                        href={`https://facebook.com/sharer/sharer.php?u=${currentUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <SiFacebook className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0 hover:bg-[#1da1f2] hover:text-white"
                      asChild
                    >
                      <a
                        href={`https://twitter.com/intent/tweet?url=${currentUrl}&text=${berita.judul}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <SiX className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0 hover:bg-[#25d366] hover:text-white"
                      asChild
                    >
                      <a
                        href={`https://wa.me/?text=${berita.judul} ${currentUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <SiWhatsapp className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Excerpt */}
            <div className="mb-6 text-lg text-muted-foreground italic border-l-4 border-primary pl-4">
              {berita.excerpt}
            </div>

            {/* Content */}
            <div
              className="news-content"
              dangerouslySetInnerHTML={{ __html: berita.konten }}
            />

            {/* Gallery */}
            {galeri.length > 0 && (
              <GalleryLightbox images={galeri} title={berita.judul} />
            )}

            {/* Tags Section - Alternative placement at bottom */}
            {beritaWithTags.tags && beritaWithTags.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    <span>Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {beritaWithTags.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/berita?tag=${tag.slug}`}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium 
                       bg-primary/10 text-primary rounded-full 
                       hover:bg-primary hover:text-primary-foreground 
                       transition-colors duration-200"
                      >
                        {tag.nama}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Related News */}
            {relatedNews.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Berita Terkait</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedNews.map((news) => (
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

            {/* Popular News */}
            {popularNews.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Berita Populer</CardTitle>
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
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const berita = await BeritaRepository.findBySlug(slug);

  if (!berita) {
    return {
      title: "Berita Tidak Ditemukan",
    };
  }

  return {
    title: `${berita.judul} | Portal Berita Kabupaten Merauke`,
    description: berita.excerpt,
    openGraph: {
      title: berita.judul,
      description: berita.excerpt,
      type: "article",
      publishedTime: berita.published_at || berita.created_at,
      authors: [berita.author_name || "Admin"],
      images: berita.featured_image
        ? [
            {
              url: berita.featured_image,
              width: 1200,
              height: 630,
              alt: berita.judul,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: berita.judul,
      description: berita.excerpt,
      images: berita.featured_image ? [berita.featured_image] : [],
    },
  };
}
