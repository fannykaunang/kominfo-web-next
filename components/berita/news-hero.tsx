// components/berita/news-hero.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const viewsFormatter = new Intl.NumberFormat("id-ID");

interface NewsItem {
  id: string;
  judul: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  kategori: {
    nama: string;
    slug: string;
    color: string;
  };
  publishedAt: string;
  views: number;
}

interface NewsHeroProps {
  mainNews: NewsItem;
  sideNews: NewsItem[];
}

export function NewsHero({ mainNews, sideNews }: NewsHeroProps) {
  return (
    <section className="container py-8 max-w-7xl mx-auto px-4 sm:px-0">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Featured News */}
        <Card className="lg:col-span-2 group overflow-hidden border-0 shadow-xl hover-lift">
          <Link href={`/berita/${mainNews.slug}`}>
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={mainNews.featuredImage || "/images/placeholder.png"}
                alt={mainNews.judul}
                fill
                priority={true}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <Badge
                  className="mb-3"
                  style={{ backgroundColor: mainNews.kategori.color }}>
                  {mainNews.kategori.nama}
                </Badge>

                <h2 className="text-2xl md:text-3xl font-bold mb-3 line-clamp-2 text-balance">
                  {mainNews.judul}
                </h2>

                <p className="text-slate-200 text-sm md:text-base mb-4 line-clamp-2">
                  {mainNews.excerpt}
                </p>

                <div className="flex items-center gap-4 text-sm text-slate-300">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(mainNews.publishedAt).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          timeZone: "UTC",
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{viewsFormatter.format(mainNews.views)} views</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </Card>

        {/* Side News */}
        <div className="flex flex-col gap-4 px-4 sm:px-0">
          {sideNews.map((news) => (
            <Card
              key={news.id}
              className="group overflow-hidden hover-lift border-0 shadow-lg">
              <Link href={`/berita/${news.slug}`}>
                <div className="flex gap-4 p-2">
                  <div className="relative w-28 h-25 shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={news.featuredImage || "/images/placeholder.png"}
                      alt={news.judul}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Badge
                      className="mb-2 text-xs"
                      variant="secondary"
                      style={{
                        backgroundColor: `${news.kategori.color}20`,
                        color: news.kategori.color,
                        borderColor: news.kategori.color,
                      }}>
                      {news.kategori.nama}
                    </Badge>

                    <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {news.judul}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(news.publishedAt).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </Card>
          ))}

          {/* View All Button */}
          <Button variant="outline" className="w-full group" asChild>
            <Link href="/berita">
              Lihat Semua Berita
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// Loading Skeleton Component
export function NewsHeroSkeleton() {
  return (
    <section className="container py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="aspect-[16/9] rounded-xl skeleton" />
        </div>
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 p-4 border rounded-xl">
              <div className="w-28 h-20 rounded-lg skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-16 rounded skeleton" />
                <div className="h-4 w-full rounded skeleton" />
                <div className="h-4 w-3/4 rounded skeleton" />
                <div className="h-3 w-20 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
