import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

const footerLinks = {
  pemerintahan: [
    { name: "Profil Daerah", href: "/tentang/profil" },
    { name: "Visi & Misi", href: "/tentang/visi-misi" },
    { name: "Struktur Organisasi", href: "/tentang/struktur" },
    { name: "SKPD", href: "/tentang/skpd" },
  ],
  layanan: [
    { name: "Layanan Publik", href: "/layanan/publik" },
    { name: "Pengaduan", href: "/layanan/pengaduan" },
    { name: "Informasi Publik", href: "/layanan/informasi" },
    { name: "Peraturan Daerah", href: "/layanan/perda" },
  ],
  informasi: [
    { name: "Berita Terkini", href: "/berita" },
    { name: "Agenda Kegiatan", href: "/agenda" },
    { name: "Galeri Foto", href: "/galeri/foto" },
    { name: "Galeri Video", href: "/galeri/video" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200">
      {/* Newsletter Section */}
      <div className="border-b border-slate-800">
        <div className="container py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-3">
              Dapatkan Berita Terbaru
            </h3>
            <p className="text-slate-400 mb-6">
              Berlangganan newsletter untuk mendapatkan informasi terkini dari Kabupaten Merauke
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Masukkan email Anda"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
              <Button className="bg-merauke-500 hover:bg-merauke-600">
                Berlangganan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-xl shadow-lg">
                M
              </div>
              <div>
                <div className="font-bold text-lg text-white">
                  Portal Berita
                </div>
                <div className="text-sm text-slate-400">
                  Kabupaten Merauke
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Portal berita resmi Pemerintah Kabupaten Merauke, menyajikan informasi 
              terkini seputar pemerintahan, pembangunan, dan kegiatan di wilayah Merauke.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-merauke-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-400">
                  Jl. Raya Mandala No. 1<br />
                  Merauke, Papua Selatan 99611
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-merauke-400 flex-shrink-0" />
                <span className="text-sm text-slate-400">(0971) 321234</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-merauke-400 flex-shrink-0" />
                <span className="text-sm text-slate-400">info@meraukekab.go.id</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Pemerintahan</h4>
            <ul className="space-y-2">
              {footerLinks.pemerintahan.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-merauke-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Layanan</h4>
            <ul className="space-y-2">
              {footerLinks.layanan.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-merauke-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Informasi</h4>
            <ul className="space-y-2">
              {footerLinks.informasi.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-merauke-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-slate-800 mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Pemerintah Kabupaten Merauke. All rights reserved.
          </p>

          {/* Social Media */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 mr-2">Ikuti Kami:</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-full hover:bg-slate-800 hover:text-merauke-400"
              asChild
            >
              <Link href="https://facebook.com" target="_blank">
                <Facebook className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-full hover:bg-slate-800 hover:text-merauke-400"
              asChild
            >
              <Link href="https://instagram.com" target="_blank">
                <Instagram className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-full hover:bg-slate-800 hover:text-merauke-400"
              asChild
            >
              <Link href="https://twitter.com" target="_blank">
                <Twitter className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-full hover:bg-slate-800 hover:text-merauke-400"
              asChild
            >
              <Link href="https://youtube.com" target="_blank">
                <Youtube className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}
