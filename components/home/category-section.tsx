// components/home/category-section.tsx

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Hammer,
  GraduationCap,
  Heart,
  Store,
  Palmtree,
  Music,
  Newspaper,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import * as Icons from "lucide-react";

interface Category {
  id: string;
  nama: string;
  slug: string;
  deskripsi?: string;
  icon?: string;
  color: string;
  _count?: {
    berita: number;
  };
}

interface CategorySectionProps {
  categories: Category[];
}

const isLucideIcon = (value: unknown): value is LucideIcon =>
  typeof value === "function" ||
  (typeof value === "object" && value !== null && "render" in value);

const iconsMap: Record<string, LucideIcon> = Object.fromEntries(
  Object.entries(Icons).filter(([, value]) => isLucideIcon(value))
) as Record<string, LucideIcon>;

const resolveIcon = (icon?: string): LucideIcon => {
  const fallback = Newspaper;
  if (!icon) return fallback;

  const normalized = icon.trim();
  if (!normalized) return fallback;

  if (iconsMap[normalized]) {
    return iconsMap[normalized];
  }

  const pascalCase = normalized
    .split(/[\s-_]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return iconsMap[pascalCase] || fallback;
};

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">Kategori Berita</h2>
            <p className="text-muted-foreground">
              Jelajahi berita berdasarkan kategori
            </p>
          </div>
          <Button variant="outline" asChild className="hidden md:flex">
            <Link href="/kategori">
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => {
         const Icon = resolveIcon(category.icon || undefined);

            return (
              <Link
                key={category.id}
                href={`/kategori/${category.slug}`}
                className="group">
                <Card
                  className="hover-lift border-0 shadow-lg h-full animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}>
                  <CardContent className="p-6 text-center">
                    {/* Icon with Color */}
                    <div className="mb-4 mx-auto">
                      <div
                        className="h-16 w-16 rounded-2xl flex items-center justify-center text-white mx-auto group-hover:scale-110 transition-transform shadow-lg"
                        style={{ backgroundColor: category.color }}>
                        <Icon className="h-8 w-8" />
                      </div>
                    </div>

                    {/* Category Name */}
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {category.nama}
                    </h3>

                    {/* News Count */}
                    {category._count && (
                      <p className="text-sm text-muted-foreground">
                        {category._count.berita} Berita
                      </p>
                    )}

                    {/* Description (optional) */}
                    {category.deskripsi && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {category.deskripsi}
                      </p>
                    )}
                  </CardContent>

                  {/* Bottom Accent */}
                  <div
                    className="h-1"
                    style={{ backgroundColor: category.color }}
                  />
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-6 md:hidden">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/kategori">
              Lihat Semua Kategori
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// Compact Category Pills
export function CategoryPills({ categories }: CategorySectionProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
       const Icon = resolveIcon(category.icon || undefined);

        return (
          <Link key={category.id} href={`/kategori/${category.slug}`}>
            <Button
              variant="outline"
              className="rounded-full group hover:scale-105 transition-transform"
              style={{
                borderColor: category.color,
                color: category.color,
              }}>
              <Icon className="h-4 w-4 mr-2" />
              {category.nama}
              {category._count && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-xs">
                  {category._count.berita}
                </span>
              )}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}

// Horizontal Scrollable Categories
export function CategoryScrollable({ categories }: CategorySectionProps) {
  return (
    <div className="overflow-x-auto custom-scrollbar pb-4">
      <div className="flex gap-4 min-w-max">
        {categories.map((category) => {
           const Icon = resolveIcon(category.icon || undefined);

          return (
            <Link
              key={category.id}
              href={`/kategori/${category.slug}`}
              className="group">
              <Card className="w-40 hover-lift border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: category.color }}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                    {category.nama}
                  </h4>
                  {category._count && (
                    <p className="text-xs text-muted-foreground">
                      {category._count.berita} Berita
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Loading Skeleton
export function CategorySectionSkeleton() {
  return (
    <section className="py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="h-8 w-48 skeleton mb-2" />
            <div className="h-4 w-64 skeleton" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardContent className="p-6 text-center space-y-3">
                <div className="h-16 w-16 rounded-2xl skeleton mx-auto" />
                <div className="h-5 w-24 skeleton mx-auto" />
                <div className="h-4 w-16 skeleton mx-auto" />
              </CardContent>
              <div className="h-1 skeleton" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
