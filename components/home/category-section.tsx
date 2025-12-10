// components/home/category-section.tsx
"use client";

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
  FolderOpen,
  Newspaper,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import * as Icons from "lucide-react";
import { motion, type Variants } from "framer-motion";

interface Category {
  id: string;
  nama: string;
  slug: string;
  deskripsi?: string | null; // Match Kategori type (can be null)
  icon?: string | null; // Match Kategori type (can be null)
  color: string | null;
  _count?: {
    berita: number;
  };
  berita_count?: number; // Support from getAllKategoriWithBeritaCount
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

// Framer Motion variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Header with Animation */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between mb-10"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <FolderOpen className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold mb-0">Kategori Berita</h2>
            </div>
            <p className="text-muted-foreground">
              Jelajahi berita berdasarkan kategori
            </p>
          </div>
          <Button variant="outline" asChild className="hidden md:flex">
            <Link href="/berita/kategori">
              Lihat Semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Categories Grid with Stagger Animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {categories.map((category, index) => {
            const Icon = resolveIcon(category.icon || undefined);
            const beritaCount =
              category._count?.berita ?? category.berita_count ?? 0;
            const categoryColor = category.color || "#3b82f6";

            return (
              <motion.div key={category.id} variants={itemVariants}>
                <Link
                  href={`/berita/kategori/${category.slug}`}
                  className="group block"
                >
                  <Card className="hover-lift border-0 shadow-lg h-full overflow-hidden">
                    <CardContent className="p-6 text-center">
                      {/* Icon with Color - Hover Scale Animation */}
                      <motion.div
                        className="mb-4 mx-auto"
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 15,
                        }}
                      >
                        <div
                          className="h-16 w-16 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg"
                          style={{ backgroundColor: categoryColor }}
                        >
                          <Icon className="h-8 w-8" />
                        </div>
                      </motion.div>

                      {/* Category Name */}
                      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                        {category.nama}
                      </h3>

                      {/* News Count */}
                      <p className="text-sm text-muted-foreground">
                        {beritaCount} Berita
                      </p>

                      {/* Description (optional) */}
                      {category.deskripsi && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {category.deskripsi}
                        </p>
                      )}
                    </CardContent>

                    {/* Bottom Accent with Slide Animation */}
                    <motion.div
                      className="h-1"
                      style={{
                        background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}dd)`,
                      }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        delay: index * 0.05 + 0.3,
                        duration: 0.5,
                        ease: "easeOut",
                      }}
                    />
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Mobile View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 md:hidden"
        >
          <Button variant="outline" className="w-full" asChild>
            <Link href="/berita/kategori">
              Lihat Semua Kategori
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

// Compact Category Pills with Animation
export function CategoryPills({ categories }: CategorySectionProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap gap-2"
    >
      {categories.map((category) => {
        const Icon = resolveIcon(category.icon || undefined);
        const beritaCount =
          category._count?.berita ?? category.berita_count ?? 0;
        const categoryColor = category.color || "#3b82f6";

        return (
          <motion.div key={category.id} variants={itemVariants}>
            <Link href={`/berita/kategori/${category.slug}`}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className="rounded-full group"
                  style={{
                    borderColor: categoryColor,
                    color: categoryColor,
                  }}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category.nama}
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-xs">
                    {beritaCount}
                  </span>
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// Horizontal Scrollable Categories with Animation
export function CategoryScrollable({ categories }: CategorySectionProps) {
  return (
    <div className="overflow-x-auto custom-scrollbar pb-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex gap-4 min-w-max"
      >
        {categories.map((category) => {
          const Icon = resolveIcon(category.icon || undefined);
          const beritaCount =
            category._count?.berita ?? category.berita_count ?? 0;
          const categoryColor = category.color || "#3b82f6";

          return (
            <motion.div key={category.id} variants={itemVariants}>
              <Link
                href={`/berita/kategori/${category.slug}`}
                className="group"
              >
                <Card className="w-40 hover-lift border-0 shadow-lg">
                  <CardContent className="p-4 text-center">
                    <motion.div
                      className="h-12 w-12 rounded-xl flex items-center justify-center text-white mx-auto mb-3"
                      style={{ backgroundColor: categoryColor }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Icon className="h-6 w-6" />
                    </motion.div>
                    <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                      {category.nama}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {beritaCount} Berita
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
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
