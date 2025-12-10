// app/hubungi-kami/hubungi-kami-client.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Home,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { AppSettings } from "@/lib/types";
import { SiTiktok } from "react-icons/si";

interface HubungiKamiClientProps {
  settings: AppSettings | null;
}

export default function HubungiKamiClient({
  settings,
}: HubungiKamiClientProps) {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    telepon: "",
    subjek: "",
    pesan: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // TODO: Implement API call to send contact form
      // For now, just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitStatus({
        type: "success",
        message:
          "Pesan Anda berhasil dikirim! Kami akan segera menghubungi Anda.",
      });
      setFormData({
        nama: "",
        email: "",
        telepon: "",
        subjek: "",
        pesan: "",
      });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Gagal mengirim pesan. Silakan coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get social media links
  const socialMedia = [
    {
      name: "Facebook",
      icon: Facebook,
      url: settings?.facebook_url,
      color: "blue-500",
      handle: settings?.facebook_url?.split("/").pop() || "meraukekab",
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: settings?.instagram_url,
      color: "pink-500",
      handle: settings?.instagram_url?.split("/").pop() || "meraukekab",
    },
    {
      name: "Twitter/X",
      icon: Twitter,
      url: settings?.twitter_url,
      color: "sky-500",
      handle: settings?.twitter_url?.split("/").pop() || "meraukekab",
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: settings?.youtube_url,
      color: "red-500",
      handle: settings?.nama_aplikasi || "Pemkab Merauke",
    },
    {
      name: "TikTok",
      icon: SiTiktok,
      url: settings?.tiktok_url,
      color: "gray-900",
      handle: settings?.tiktok_url?.split("/").pop() || "meraukekab",
    },
  ].filter((social) => social.url); // Only show if URL exists

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
          <span className="text-foreground font-medium">Hubungi Kami</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <header className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                Hubungi Kami
              </h1>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                <p className="text-muted-foreground italic">
                  Kami siap membantu Anda. Silakan hubungi kami melalui formulir
                  di bawah ini atau melalui kontak yang tersedia.
                </p>
              </div>
            </header>

            {/* Contact Form */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Kirim Pesan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nama */}
                  <div className="space-y-2">
                    <Label htmlFor="nama">
                      Nama Lengkap <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nama"
                      name="nama"
                      type="text"
                      placeholder="Masukkan nama lengkap Anda"
                      value={formData.nama}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Email & Telepon */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="nama@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telepon">Nomor Telepon</Label>
                      <Input
                        id="telepon"
                        name="telepon"
                        type="tel"
                        placeholder="08xx xxxx xxxx"
                        value={formData.telepon}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Subjek */}
                  <div className="space-y-2">
                    <Label htmlFor="subjek">
                      Subjek <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="subjek"
                      name="subjek"
                      type="text"
                      placeholder="Masukkan subjek pesan"
                      value={formData.subjek}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Pesan */}
                  <div className="space-y-2">
                    <Label htmlFor="pesan">
                      Pesan <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="pesan"
                      name="pesan"
                      placeholder="Tulis pesan Anda di sini..."
                      value={formData.pesan}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      rows={6}
                    />
                  </div>

                  {/* Submit Status */}
                  {submitStatus.type && (
                    <div
                      className={`p-4 rounded-lg ${
                        submitStatus.type === "success"
                          ? "bg-green-50 text-green-900 border border-green-200 dark:bg-green-950 dark:text-green-100"
                          : "bg-red-50 text-red-900 border border-red-200 dark:bg-red-950 dark:text-red-100"
                      }`}
                      role="alert"
                    >
                      {submitStatus.message}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Kirim Pesan
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Map (Optional) */}
            {settings?.google_maps_embed && (
              <Card className="border-0 shadow-lg mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Lokasi Kantor
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="w-full h-[400px] bg-muted rounded-b-lg overflow-hidden">
                    <iframe
                      src={settings.google_maps_embed}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Lokasi Kantor"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Informasi Kontak */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Informasi Kontak</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Alamat */}
                {settings?.alamat && (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">Alamat</h3>
                        <address className="text-sm text-muted-foreground not-italic">
                          {settings.alamat.split("\n").map((line, i) => (
                            <span key={i}>
                              {line}
                              {i < settings.alamat.split("\n").length - 1 && (
                                <br />
                              )}
                            </span>
                          ))}
                        </address>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Email */}
                {settings?.email && (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">Email</h3>
                        <a
                          href={`mailto:${settings.email}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {settings.email}
                        </a>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Telepon */}
                {settings?.no_telepon && (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">Telepon</h3>
                        <a
                          href={`tel:${settings.no_telepon.replace(/\s/g, "")}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {settings.no_telepon}
                        </a>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Website */}
                {settings?.website && (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">Website</h3>
                        <a
                          href={settings.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {settings.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Jam Operasional */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">
                      Jam Operasional
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      <strong>Senin - Kamis:</strong>
                      <br />
                      08:00 - 16:00 WIT
                      <br />
                      <strong>Jumat:</strong>
                      <br />
                      08:00 - 16:30 WIT
                      <br />
                      <strong className="text-destructive">
                        Sabtu - Minggu: Tutup
                      </strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            {socialMedia.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Media Sosial</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {socialMedia.map((social) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={social.name}
                          href={social.url || undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                        >
                          <div
                            className={`p-2 bg-${social.color}/10 rounded-lg group-hover:bg-${social.color}/20 transition-colors`}
                          >
                            <Icon className={`h-5 w-5 text-${social.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {social.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              @{social.handle}
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Call to Action */}
            {settings?.no_telepon && (
              <Card className="border-0 shadow-lg bg-primary/5">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">Perlu Bantuan Cepat?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Untuk pertanyaan mendesak, hubungi hotline kami
                  </p>
                  <a
                    href={`tel:${settings.no_telepon.replace(/\s/g, "")}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    <Phone className="h-4 w-4" />
                    {settings.no_telepon}
                  </a>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
