import { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Tentang Kami | Portal Berita Kabupaten Merauke",
  description:
    "Informasi tentang Portal Berita Kabupaten Merauke - Visi, Misi, dan Profil Portal Berita Resmi Pemerintah Kabupaten Merauke",
  keywords: [
    "tentang portal merauke",
    "profil portal berita",
    "kabupaten merauke",
    "pemerintah merauke",
    "visi misi",
  ],
  openGraph: {
    title: "Tentang Kami | Portal Berita Kabupaten Merauke",
    description:
      "Portal Berita Resmi Pemerintah Kabupaten Merauke - Media Informasi dan Komunikasi Publik",
    type: "website",
  },
  alternates: {
    canonical: "/tentang",
  },
};

export default function TentangPage() {
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
          <span className="text-foreground font-medium">Tentang Kami</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-2">
            {/* Header */}
            <div className="mb-6">
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
            </div>

            {/* Profil */}
            <Card className="border-0 shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Profil Portal
                </CardTitle>
              </CardHeader>
              <CardContent className="news-content space-y-4">
                <p>
                  Portal Berita Kabupaten Merauke merupakan media informasi dan
                  komunikasi publik resmi yang dikelola oleh Pemerintah
                  Kabupaten Merauke. Portal ini hadir sebagai sarana untuk
                  menyebarluaskan informasi pemerintahan, pembangunan daerah,
                  dan berbagai kegiatan di Kabupaten Merauke kepada masyarakat
                  luas.
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
                  budaya, hingga olahraga dan pariwisata. Selain itu, portal ini
                  juga menyediakan berbagai informasi layanan publik, dokumen
                  pemerintahan, dan data statistik daerah.
                </p>
              </CardContent>
            </Card>

            {/* Visi */}
            <Card className="border-0 shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Visi
                </CardTitle>
              </CardHeader>
              <CardContent className="news-content">
                <p className="text-lg font-medium text-primary">
                  "Menjadi Portal Berita Terpercaya dan Terdepan dalam
                  Menyajikan Informasi Publik yang Transparan, Akurat, dan
                  Bermanfaat bagi Masyarakat Kabupaten Merauke"
                </p>
              </CardContent>
            </Card>

            {/* Misi */}
            <Card className="border-0 shadow-lg mb-6">
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
                    Meningkatkan transparansi dan akuntabilitas penyelenggaraan
                    pemerintahan melalui publikasi informasi yang terbuka
                  </li>
                  <li>
                    Menjadi media komunikasi efektif antara pemerintah daerah
                    dengan masyarakat
                  </li>
                  <li>
                    Mendorong partisipasi masyarakat dalam pembangunan daerah
                    melalui penyediaan informasi yang komprehensif
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

            {/* Nilai-Nilai */}
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
                      Menyampaikan berita dan informasi secara cepat dan up to
                      date sesuai perkembangan terkini.
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
                      Mengelola portal dengan standar jurnalistik yang baik dan
                      etika komunikasi publik yang profesional.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <div className="flex items-start gap-3 mb-3">
                    <Building2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Alamat</h4>
                      <p className="text-sm text-muted-foreground">
                        Jl. Raya Mandala No. 1<br />
                        Merauke, Papua Selatan
                      </p>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-start gap-3 mb-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Email</h4>
                      <p className="text-sm text-muted-foreground">
                        humas@meraukekab.go.id
                      </p>
                    </div>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">
                        Jam Operasional
                      </h4>
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
                    <div className="text-2xl font-bold text-primary">500+</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Berita Published
                    </div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">50+</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Halaman Informasi
                    </div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">10K+</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Pengunjung/Bulan
                    </div>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">15+</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Kategori Berita
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
  );
}
