// components/home/home-slider.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Slider } from "@/lib/types";
import { NewsImage } from "../../components/berita/news-image";

interface SideNewsItem {
  id: string;
  judul: string;
  slug: string;
  featuredImage: string;
  kategori: {
    nama: string;
    slug: string;
    color: string;
  };
  publishedAt: string;
}

interface HomeSliderProps {
  sliders: Pick<Slider, "id" | "judul" | "deskripsi" | "image">[];
  sideNews: SideNewsItem[];
}

export function HomeSlider({ sliders, sideNews }: HomeSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const safeSlides = useMemo(() => sliders ?? [], [sliders]);

  useEffect(() => {
    if (safeSlides.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % safeSlides.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [safeSlides.length]);

  const showFallback = safeSlides.length === 0;
  const currentSlide = safeSlides[activeIndex];

  const goPrev = () => {
    setActiveIndex(
      (prev) => (prev - 1 + safeSlides.length) % safeSlides.length
    );
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % safeSlides.length);
  };

  return (
    <section className="container py-8 max-w-7xl mx-auto px-4 sm:px-0">
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden border-0 shadow-xl relative">
          {showFallback ? (
            <div className="aspect-video flex items-center justify-center bg-muted text-muted-foreground">
              Belum ada slider yang tersedia
            </div>
          ) : (
            <div className="relative aspect-video overflow-hidden">
              {/* Track gambar dengan efek slide halus */}
              <div className="absolute inset-0">
                <div
                  className="flex h-full transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
                  {safeSlides.map((slide) => (
                    <div key={slide.id} className="relative min-w-full h-full">
                      <NewsImage
                        src={slide.image}
                        alt={slide.judul}
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Overlay gelap di atas gambar */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

              {/* Deskripsi – di atas indikator */}
              <div className="absolute inset-x-0 bottom-0 p-6 pb-14 text-white space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide">
                  Slider
                </div>
                <h2
                  className="font-bold leading-tight text-balance
             text-lg sm:text-xl md:text-2xl lg:text-3xl">
                  {currentSlide?.judul}
                </h2>
                {currentSlide?.deskripsi ? (
                  <p className="text-xs sm:text-sm md:text-base text-slate-200 line-clamp-3">
                    {currentSlide.deskripsi}
                  </p>
                ) : null}
              </div>

              {safeSlides.length > 1 && (
                <>
                  {/* Tombol kiri di tengah vertikal */}
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-white/20 hover:bg-white"
                    onClick={goPrev}>
                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>

                  {/* Tombol kanan di tengah vertikal */}
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-white/20 hover:bg-white"
                    onClick={goNext}>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>

                  {/* Indikator di bawah, tidak menutupi deskripsi */}
                  <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
                    {safeSlides.map((slide, index) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={`h-2 rounded-full transition-all ${index === activeIndex
                            ? "w-8 bg-primary"
                            : "w-2 bg-white/70 hover:bg-white"
                          }`}
                        aria-label={`Pilih slider ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-4 px-4 sm:px-0">
          {sideNews.length > 0 ? (
            sideNews.map((news) => (
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
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground border rounded-xl bg-muted/50">
              Belum ada berita highlight untuk ditampilkan
            </div>
          )}

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
