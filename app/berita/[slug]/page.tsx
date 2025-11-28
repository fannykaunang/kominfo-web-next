import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Calendar, Eye, User, Share2, Facebook, Twitter, Whatsapp, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { NewsCardCompact } from "@/components/berita/news-card"

interface NewsDetailPageProps {
  params: {
    slug: string
  }
}

// Mock data - In production, fetch from API/database
const mockNewsDetail = {
  id: "1",
  judul: "Pembangunan Jalan Trans Papua Merauke Dipercepat",
  slug: "pembangunan-jalan-trans-papua-merauke-dipercepat",
  excerpt: "Pemerintah Kabupaten Merauke mempercepat pembangunan infrastruktur jalan Trans Papua untuk meningkatkan konektivitas dan aksesibilitas wilayah.",
  konten: `
    <p>Pemerintah Kabupaten Merauke terus berkomitmen untuk mempercepat pembangunan infrastruktur jalan Trans Papua. Program ini merupakan bagian dari upaya meningkatkan konektivitas dan aksesibilitas di wilayah Papua Selatan.</p>

    <p>Bupati Merauke menyatakan bahwa pembangunan jalan Trans Papua merupakan prioritas utama dalam mendukung pertumbuhan ekonomi daerah. "Dengan infrastruktur jalan yang baik, diharapkan dapat membuka akses ke berbagai daerah dan meningkatkan kesejahteraan masyarakat," ujar Bupati.</p>

    <h2>Target Penyelesaian</h2>
    <p>Proyek pembangunan jalan sepanjang 150 kilometer ini ditargetkan selesai dalam waktu 24 bulan. Pekerjaan saat ini telah mencapai progress 35% dan terus dipantau secara ketat untuk memastikan penyelesaian tepat waktu.</p>

    <h2>Manfaat bagi Masyarakat</h2>
    <p>Pembangunan jalan Trans Papua ini akan memberikan berbagai manfaat, antara lain:</p>
    <ul>
      <li>Meningkatkan aksesibilitas ke daerah-daerah terpencil</li>
      <li>Memperlancar distribusi barang dan jasa</li>
      <li>Membuka peluang ekonomi baru bagi masyarakat</li>
      <li>Meningkatkan akses terhadap layanan kesehatan dan pendidikan</li>
    </ul>

    <p>Selain itu, proyek ini juga diharapkan dapat membuka lapangan kerja baru bagi masyarakat setempat, baik selama masa konstruksi maupun setelah jalan beroperasi.</p>

    <h2>Komitmen Pemerintah</h2>
    <p>Pemerintah Kabupaten Merauke berkomitmen untuk terus memantau dan memastikan kualitas pembangunan sesuai dengan standar yang ditetapkan. Pengawasan ketat dilakukan mulai dari proses perencanaan hingga pelaksanaan di lapangan.</p>
  `,
  featuredImage: "/images/news-1.jpg",
  galeri: ["/images/gallery-1.jpg", "/images/gallery-2.jpg", "/images/gallery-3.jpg"],
  kategori: {
    nama: "Pembangunan",
    slug: "pembangunan",
    color: "#f59e0b",
  },
  author: {
    name: "Admin Portal",
    avatar: null,
  },
  publishedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  views: 1250,
  tags: [
    { id: "1", nama: "Trans Papua", slug: "trans-papua" },
    { id: "2", nama: "Infrastruktur", slug: "infrastruktur" },
    { id: "3", nama: "Pembangunan Daerah", slug: "pembangunan-daerah" },
  ],
}

const mockRelatedNews = [
  {
    judul: "Perbaikan Jembatan di Distrik Okaba Dimulai",
    slug: "perbaikan-jembatan-distrik-okaba",
    featuredImage: "/images/news-2.jpg",
    kategori: { nama: "Pembangunan", slug: "pembangunan", color: "#f59e0b" },
    publishedAt: new Date().toISOString(),
  },
  {
    judul: "Pemerintah Bangun Fasilitas Publik Baru",
    slug: "pemerintah-bangun-fasilitas-publik",
    featuredImage: "/images/news-3.jpg",
    kategori: { nama: "Pembangunan", slug: "pembangunan", color: "#f59e0b" },
    publishedAt: new Date().toISOString(),
  },
  {
    judul: "Peningkatan Kualitas Jalan di Wilayah Perbatasan",
    slug: "peningkatan-kualitas-jalan-perbatasan",
    featuredImage: "/images/news-4.jpg",
    kategori: { nama: "Pembangunan", slug: "pembangunan", color: "#f59e0b" },
    publishedAt: new Date().toISOString(),
  },
]

export default function NewsDetailPage({ params }: NewsDetailPageProps) {
  // In production, fetch news by slug
  // const news = await getNewsBySlug(params.slug)
  // if (!news) notFound()

  const news = mockNewsDetail
  const currentUrl = `https://meraukekab.go.id/berita/${params.slug}`

  return (
    <main className="py-8">
      <div className="container">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-2">
            {/* Category Badge */}
            <Badge
              className="mb-4"
              style={{ backgroundColor: news.kategori.color }}
            >
              {news.kategori.nama}
            </Badge>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              {news.judul}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {news.author.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{news.author.name}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(news.publishedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{news.views.toLocaleString()} views</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>5 menit baca</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative aspect-video mb-8 rounded-xl overflow-hidden">
              <Image
                src={news.featuredImage}
                alt={news.judul}
                fill
                className="object-cover"
                priority
              />
            </div>

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
                        <Facebook className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0 hover:bg-[#1da1f2] hover:text-white"
                      asChild
                    >
                      <a
                        href={`https://twitter.com/intent/tweet?url=${currentUrl}&text=${news.judul}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 p-0 hover:bg-[#25d366] hover:text-white"
                      asChild
                    >
                      <a
                        href={`https://wa.me/?text=${news.judul} ${currentUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Whatsapp className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <div
              className="prose-custom prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: news.konten }}
            />

            {/* Tags */}
            <div className="mt-8 pt-8 border-t">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                {news.tags.map((tag) => (
                  <Link key={tag.id} href={`/tag/${tag.slug}`}>
                    <Badge variant="secondary" className="hover:bg-primary hover:text-white transition-colors">
                      {tag.nama}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Related News */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Berita Terkait</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockRelatedNews.map((relatedNews) => (
                  <NewsCardCompact key={relatedNews.slug} {...relatedNews} />
                ))}
              </CardContent>
            </Card>

            {/* Popular News */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Berita Populer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockRelatedNews.map((popularNews) => (
                  <NewsCardCompact key={popularNews.slug} {...popularNews} />
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  )
}
