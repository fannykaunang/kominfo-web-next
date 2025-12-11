// components/layout/footer-client.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import {
  SiFacebook,
  SiInstagram,
  SiX,
  SiYoutube,
  SiTiktok,
} from "react-icons/si";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AppSettings } from "@/lib/types";

const footerLinks = {
  tentang: [
    { name: "Tentang Kami", href: "/tentang" },
    { name: "Hubungi Kami", href: "/hubungi-kami" },
    { name: "SKPD", href: "/organisasi/skpd" },
  ],
  layanan: [
    { name: "Berita", href: "/berita" },
    { name: "Galeri Foto", href: "/galeri/foto" },
    { name: "Galeri Video", href: "/galeri/video" },
  ],
  informasi: [
    { name: "Profil Daerah", href: "/profil" },
    { name: "Visi & Misi", href: "/visi-misi" },
    { name: "Struktur Organisasi", href: "/organisasi" },
  ],
};

interface FooterClientProps {
  settings: AppSettings | null;
}

export function FooterClient({ settings }: FooterClientProps) {
  // Extract social media URLs
  const socialMedia = [
    {
      name: "Facebook",
      icon: SiFacebook,
      url: settings?.facebook_url,
      color: "hover:text-blue-500",
    },
    {
      name: "Instagram",
      icon: SiInstagram,
      url: settings?.instagram_url,
      color: "hover:text-pink-500",
    },
    {
      name: "Twitter",
      icon: SiX,
      url: settings?.twitter_url,
      color: "hover:text-slate-300",
    },
    {
      name: "YouTube",
      icon: SiYoutube,
      url: settings?.youtube_url,
      color: "hover:text-red-500",
    },
    {
      name: "TikTok",
      icon: SiTiktok,
      url: settings?.tiktok_url,
      color: "hover:text-slate-300",
    },
  ].filter((social) => social.url); // Only show if URL exists

  return (
    <footer className="bg-slate-900 text-slate-200">
      {/* Newsletter Section */}
      <div className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-3">Dapatkan Berita Terbaru</h3>
            <p className="text-slate-400 mb-6">
              Berlangganan newsletter untuk mendapatkan informasi terkini dari
              {settings?.nama_aplikasi
                ? ` ${settings.nama_aplikasi}`
                : " Kabupaten Merauke"}
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Masukkan email Anda"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                aria-label="Email untuk newsletter"
              />
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                Berlangganan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            {/* Logo & Description */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                {settings?.logo ? (
                  <div className="relative h-12 w-12 rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={settings.logo}
                      alt={settings.nama_aplikasi || "Logo"}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {settings?.nama_aplikasi?.charAt(0) || "M"}
                  </div>
                )}
                <div>
                  <div className="font-bold text-lg text-white">
                    {settings?.nama_aplikasi || "Portal Berita"}
                  </div>
                  <div className="text-sm text-slate-400">
                    Kabupaten Merauke
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                {settings?.meta_description ||
                  "Portal berita resmi Pemerintah Kabupaten Merauke, menyajikan informasi terkini seputar pemerintahan, pembangunan, dan kegiatan di wilayah Merauke."}
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                {settings?.alamat && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-merauke-400 mt-0.5 shrink-0" />
                    <address className="text-sm text-slate-400 not-italic">
                      {settings.alamat.split("\n").map((line, i) => (
                        <span key={i}>
                          {line}
                          {i < settings.alamat.split("\n").length - 1 && <br />}
                        </span>
                      ))}
                    </address>
                  </div>
                )}
                {settings?.no_telepon && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-merauke-400 shrink-0" />
                    <a
                      href={`tel:${settings.no_telepon.replace(/\s/g, "")}`}
                      className="text-sm text-slate-400 hover:text-merauke-400 transition-colors"
                    >
                      {settings.no_telepon}
                    </a>
                  </div>
                )}
                {settings?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-merauke-400 shrink-0" />
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-sm text-slate-400 hover:text-merauke-400 transition-colors"
                    >
                      {settings.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Tentang</h4>
              <ul className="space-y-2">
                {footerLinks.tentang.map((link) => (
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
            <p className="text-sm text-slate-400" suppressHydrationWarning>
              © {new Date().getFullYear()}{" "}
              {settings?.nama_aplikasi || "Pemerintah Kabupaten Merauke"}. All
              rights reserved.
            </p>

            {/* Social Media */}
            {socialMedia.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400 mr-2">Ikuti Kami:</span>
                {socialMedia.map((social) => {
                  const Icon = social.icon;
                  return (
                    <Button
                      key={social.name}
                      size="icon"
                      variant="ghost"
                      className={`h-9 w-9 rounded-full hover:bg-slate-800 ${social.color} transition-colors`}
                      asChild
                    >
                      <a
                        href={social.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
