// app/tentang/page.tsx

import Link from "next/link";
import {
  Home,
  ChevronRight,
  Target,
  Eye,
  Users,
  Award,
  Building2,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  generatePublicMetadata,
  generateBreadcrumbStructuredData,
  generateOrganizationStructuredData,
} from "@/lib/metadata-helpers";
import { getAppSettings } from "@/lib/models/settings.model";
import { BeritaRepository } from "@/lib/models/berita.model";
import { getVisitorStats } from "@/lib/models/visitor.model";
import { getKategoriStats } from "@/lib/models/kategori.model";

// Generate metadata untuk SEO
export async function generateMetadata() {
  return generatePublicMetadata({
    title: "Tentang Kami",
    description:
      "Informasi lengkap tentang Portal Berita Kabupaten Merauke - Visi, Misi, Nilai-Nilai, dan Profil Portal Berita Resmi Pemerintah Kabupaten Merauke yang transparan, akurat, dan terpercaya.",
    keywords: [
      "tentang portal merauke",
      "profil portal berita merauke",
      "visi misi merauke",
      "pemerintah kabupaten merauke",
      "portal resmi merauke",
      "media informasi merauke",
      "transparansi pemerintah",
    ],
    path: "/tentang",
    type: "website",
  });
}

export default async function TentangPage() {
  // Fetch settings untuk organization structured data
  const settings = await getAppSettings();

  // Fetch statistics dari database
  const beritaStats = await BeritaRepository.getStats();
  const visitorStats = await getVisitorStats();
  const kategoriStats = await getKategoriStats();

  // Generate breadcrumb structured data
  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "Beranda", url: "/" },
    { name: "Tentang Kami", url: "/tentang" },
  ]);

  // Generate organization structured data
  const organizationData = await generateOrganizationStructuredData();

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      {organizationData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
        />
      )}

      <main className="py-8 px-4 sm:px-8">
        <div className="container max-w-7xl">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
            aria-label="Breadcrumb"
          >
            <Link
              href="/"
              className="flex items-center hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">Beranda</span>
            </Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span className="text-foreground font-medium">Tentang Kami</span>
          </nav>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <article className="lg:col-span-2">
              {/* Header */}
              <header className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                  Tentang Portal Berita Kabupaten Merauke
                </h1>

                <div className="mt-4 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                  <p className="text-muted-foreground italic">
                    Portal Berita Resmi Pemerintah Kabupaten Merauke - Media
                    informasi dan komunikasi publik yang transparan, akuntabel,
                    dan terpercaya.
                  </p>
                </div>
              </header>

              {/* Profil */}
              <section className="mb-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Profil Portal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="news-content space-y-4">
                    <p>
                      Portal Berita Kabupaten Merauke merupakan media informasi
                      dan komunikasi publik resmi yang dikelola oleh Pemerintah
                      Kabupaten Merauke. Portal ini hadir sebagai sarana untuk
                      menyebarluaskan informasi pemerintahan, pembangunan
                      daerah, dan berbagai kegiatan di Kabupaten Merauke kepada
                      masyarakat luas.
                    </p>
                    <p>
                      Dengan mengusung prinsip transparansi dan akuntabilitas,
                      portal ini menjadi jembatan komunikasi antara pemerintah
                      daerah dengan masyarakat, serta menjadi sumber informasi
                      terpercaya tentang berbagai program, kebijakan, dan
                      perkembangan di Kabupaten Merauke.
                    </p>
                    <p>
                      Portal ini menyajikan berbagai kategori berita mulai dari
                      pemerintahan, pembangunan, ekonomi, pendidikan, kesehatan,
                      budaya, hingga olahraga dan pariwisata. Selain itu, portal
                      ini juga menyediakan berbagai informasi layanan publik,
                      dokumen pemerintahan, dan data statistik daerah.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* Visi */}
              <section className="mb-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Visi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="news-content">
                    <blockquote className="text-lg font-medium text-primary border-l-4 border-primary pl-4">
                      Menjadi Portal Berita Terpercaya dan Terdepan dalam
                      Menyajikan Informasi Publik yang Transparan, Akurat, dan
                      Bermanfaat bagi Masyarakat Kabupaten Merauke
                    </blockquote>
                  </CardContent>
                </Card>
              </section>

              {/* Misi */}
              <section className="mb-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Misi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="news-content">
                    <ol className="list-decimal list-inside space-y-3">
                      <li>
                        Menyajikan informasi pemerintahan dan pembangunan daerah
                        secara cepat, akurat, dan mudah diakses oleh masyarakat
                      </li>
                      <li>
                        Meningkatkan transparansi dan akuntabilitas
                        penyelenggaraan pemerintahan melalui publikasi informasi
                        yang terbuka
                      </li>
                      <li>
                        Menjadi media komunikasi efektif antara pemerintah
                        daerah dengan masyarakat
                      </li>
                      <li>
                        Mendorong partisipasi masyarakat dalam pembangunan
                        daerah melalui penyediaan informasi yang komprehensif
                      </li>
                      <li>
                        Mempromosikan potensi dan keunggulan daerah Kabupaten
                        Merauke kepada masyarakat luas
                      </li>
                      <li>
                        Memberikan layanan informasi publik yang profesional dan
                        berkualitas
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </section>

              {/* Nilai-Nilai */}
              <section>
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Nilai-Nilai Portal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="news-content">
                    <div className="grid gap-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2 text-primary">
                          Transparansi
                        </h3>
                        <p className="text-muted-foreground">
                          Menyajikan informasi secara terbuka dan jujur kepada
                          publik tanpa ada yang disembunyikan.
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="font-semibold text-lg mb-2 text-primary">
                          Akurasi
                        </h3>
                        <p className="text-muted-foreground">
                          Memastikan setiap informasi yang dipublikasikan telah
                          diverifikasi kebenarannya dan berasal dari sumber yang
                          terpercaya.
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="font-semibold text-lg mb-2 text-primary">
                          Aktualitas
                        </h3>
                        <p className="text-muted-foreground">
                          Menyampaikan berita dan informasi secara cepat dan up
                          to date sesuai perkembangan terkini.
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="font-semibold text-lg mb-2 text-primary">
                          Akuntabilitas
                        </h3>
                        <p className="text-muted-foreground">
                          Bertanggung jawab atas setiap informasi yang
                          dipublikasikan dan siap memberikan klarifikasi jika
                          diperlukan.
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="font-semibold text-lg mb-2 text-primary">
                          Profesionalisme
                        </h3>
                        <p className="text-muted-foreground">
                          Mengelola portal dengan standar jurnalistik yang baik
                          dan etika komunikasi publik yang profesional.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Quick Info */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Cepat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    {settings?.alamat && (
                      <>
                        <div className="flex items-start gap-3 mb-3">
                          <Building2
                            className="h-5 w-5 text-primary mt-0.5"
                            aria-hidden="true"
                          />
                          <div>
                            <h3 className="font-semibold text-sm mb-1">
                              Alamat
                            </h3>
                            <address className="text-sm text-muted-foreground not-italic">
                              {settings.alamat.split("\n").map((line, i) => (
                                <span key={i}>
                                  {line}
                                  {i <
                                    settings.alamat.split("\n").length - 1 && (
                                    <br />
                                  )}
                                </span>
                              ))}
                            </address>
                          </div>
                        </div>
                        <Separator className="my-3" />
                      </>
                    )}
                    {settings?.email && (
                      <>
                        <div className="flex items-start gap-3 mb-3">
                          <Mail
                            className="h-5 w-5 text-primary mt-0.5"
                            aria-hidden="true"
                          />
                          <div>
                            <h3 className="font-semibold text-sm mb-1">
                              Email
                            </h3>
                            <a
                              href={`mailto:${settings.email}`}
                              className="text-sm text-primary hover:underline"
                            >
                              {settings.email}
                            </a>
                          </div>
                        </div>
                        <Separator className="my-3" />
                      </>
                    )}
                    <div className="flex items-start gap-3">
                      <Users
                        className="h-5 w-5 text-primary mt-0.5"
                        aria-hidden="true"
                      />
                      <div>
                        <h3 className="font-semibold text-sm mb-1">
                          Jam Operasional
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Senin - Jumat
                          <br />
                          08:00 - 16:00 WIT
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistik */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Statistik Portal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {beritaStats.published.toLocaleString("id-ID")}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Berita Published
                      </div>
                    </div>
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {kategoriStats.total}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Kategori Berita
                      </div>
                    </div>
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {visitorStats.this_month.toLocaleString("id-ID")}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Pengunjung/Bulan
                      </div>
                    </div>
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {visitorStats.unique_ips.toLocaleString("id-ID")}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Pengunjung Unik
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Call to Action */}
              <Card className="border-0 shadow-lg bg-primary/5">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Ada Pertanyaan?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hubungi kami untuk informasi lebih lanjut
                  </p>
                  <Link
                    href="/hubungi-kami"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    <Mail className="h-4 w-4" />
                    Hubungi Kami
                  </Link>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
