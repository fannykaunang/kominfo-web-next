import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Eye,
  User,
  ChevronRight,
  Home,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  getHalamanByMenuAndSlug,
  getHalamanByMenuId,
} from "@/lib/models/halaman.model";
import { getMenuBySlug } from "@/lib/models/menu.model";

interface HalamanPageProps {
  params: Promise<{
    menuSlug: string;
    halamanSlug: string;
  }>;
}

export default async function HalamanPage({ params }: HalamanPageProps) {
  // Await params
  const { menuSlug, halamanSlug } = await params;

  // Get halaman by menu slug and halaman slug
  const halaman = await getHalamanByMenuAndSlug(menuSlug, halamanSlug);

  if (!halaman) {
    notFound();
  }

  // Get menu info
  const menu = await getMenuBySlug(menuSlug);

  if (!menu) {
    notFound();
  }

  // Get related halaman (other pages in same menu)
  const relatedHalaman = await getHalamanByMenuId(menu.id);
  const otherHalaman = relatedHalaman.filter((h) => h.id !== halaman.id);

  return (
    <main className="py-8 px-4 sm:px-8">
      <div className="container max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link
            href="/"
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/${menuSlug}`}
            className="hover:text-foreground transition-colors"
          >
            {menu.nama}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{halaman.judul}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                {halaman.judul}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {halaman.author_name && (
                  <>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {halaman.author_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{halaman.author_name}</span>
                    </div>
                    <Separator orientation="vertical" className="h-4" />
                  </>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(halaman.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{halaman.views.toLocaleString()} views</span>
                </div>
              </div>

              {/* Excerpt */}
              {halaman.excerpt && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                  <p className="text-muted-foreground italic">
                    {halaman.excerpt}
                  </p>
                </div>
              )}
            </div>

            {/* Content */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 md:p-8">
                <div
                  className="news-content"
                  dangerouslySetInnerHTML={{ __html: halaman.konten }}
                />
              </CardContent>
            </Card>

            {/* Updated Info */}
            <div className="mt-6 text-sm text-muted-foreground">
              Terakhir diperbarui:{" "}
              {new Date(halaman.updated_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Menu Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Tentang Menu Ini</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{menu.nama}</h3>
                    {menu.deskripsi && (
                      <p className="text-sm text-muted-foreground">
                        {menu.deskripsi}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Pages */}
            {otherHalaman.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Halaman Terkait
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {otherHalaman.map((h) => (
                    <Link
                      key={h.id}
                      href={`/${menuSlug}/${h.slug}`}
                      className="block p-3 rounded-lg hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {h.judul}
                          </h4>
                          {h.excerpt && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {h.excerpt}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Back to Menu */}
            <Card className="border-0 shadow-lg bg-primary/5">
              <CardContent className="p-4">
                <Link
                  href={`/${menuSlug}`}
                  className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  Kembali ke {menu.nama}
                </Link>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: HalamanPageProps) {
  const { menuSlug, halamanSlug } = await params;

  const halaman = await getHalamanByMenuAndSlug(menuSlug, halamanSlug);

  if (!halaman) {
    return {
      title: "Halaman Tidak Ditemukan",
    };
  }

  const menu = await getMenuBySlug(menuSlug);

  // Use meta_title or fallback to judul
  const title =
    halaman.meta_title ||
    `${halaman.judul} - ${
      menu?.nama || "Portal"
    } | Portal Berita Kabupaten Merauke`;

  // Use meta_description or fallback to excerpt
  const description =
    halaman.meta_description ||
    halaman.excerpt ||
    `Informasi tentang ${halaman.judul} - ${
      menu?.nama || ""
    } Kabupaten Merauke`;

  return {
    title,
    description,
    keywords: [
      halaman.judul,
      menu?.nama || "",
      "kabupaten merauke",
      "pemerintah merauke",
      "informasi publik",
      "portal berita merauke",
    ],
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: halaman.created_at,
      modifiedTime: halaman.updated_at,
      authors: halaman.author_name ? [halaman.author_name] : [],
      section: menu?.nama,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `/${menuSlug}/${halamanSlug}`,
    },
  };
}
