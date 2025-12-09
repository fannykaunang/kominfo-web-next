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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

export default function HubungiKamiPage() {
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
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
                Hubungi Kami
              </h1>

              <div className="mt-4 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                <p className="text-muted-foreground italic">
                  Kami siap membantu Anda. Silakan hubungi kami melalui formulir
                  di bawah ini atau melalui kontak yang tersedia.
                </p>
              </div>
            </div>

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
                          ? "bg-green-50 text-green-900 border border-green-200"
                          : "bg-red-50 text-red-900 border border-red-200"
                      }`}
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

            {/* Map (Optional - uncomment if you have coordinates) */}
            {/* <Card className="border-0 shadow-lg mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Lokasi Kantor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full h-[400px] bg-muted rounded-b-lg">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d..."
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </CardContent>
            </Card> */}
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
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Alamat</h4>
                    <p className="text-sm text-muted-foreground">
                      Jl. Raya Mandala No. 1
                      <br />
                      Kelapa Lima, Merauke
                      <br />
                      Papua Selatan 99611
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Email</h4>
                    <a
                      href="mailto:humas@meraukekab.go.id"
                      className="text-sm text-primary hover:underline"
                    >
                      humas@meraukekab.go.id
                    </a>
                    <br />
                    <a
                      href="mailto:info@meraukekab.go.id"
                      className="text-sm text-primary hover:underline"
                    >
                      info@meraukekab.go.id
                    </a>
                  </div>
                </div>

                <Separator />

                {/* Telepon */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Telepon</h4>
                    <a
                      href="tel:+62971321015"
                      className="text-sm text-primary hover:underline"
                    >
                      (0971) 321 015
                    </a>
                    <br />
                    <a
                      href="tel:+62971321016"
                      className="text-sm text-primary hover:underline"
                    >
                      (0971) 321 016
                    </a>
                  </div>
                </div>

                <Separator />

                {/* Jam Operasional */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">
                      Jam Operasional
                    </h4>
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
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Media Sosial</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <a
                    href="https://facebook.com/meraukekab"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                  >
                    <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                      <Facebook className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Facebook</div>
                      <div className="text-xs text-muted-foreground">
                        @meraukekab
                      </div>
                    </div>
                  </a>

                  <a
                    href="https://instagram.com/meraukekab"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                  >
                    <div className="p-2 bg-pink-500/10 rounded-lg group-hover:bg-pink-500/20 transition-colors">
                      <Instagram className="h-5 w-5 text-pink-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Instagram</div>
                      <div className="text-xs text-muted-foreground">
                        @meraukekab
                      </div>
                    </div>
                  </a>

                  <a
                    href="https://twitter.com/meraukekab"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                  >
                    <div className="p-2 bg-sky-500/10 rounded-lg group-hover:bg-sky-500/20 transition-colors">
                      <Twitter className="h-5 w-5 text-sky-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">Twitter/X</div>
                      <div className="text-xs text-muted-foreground">
                        @meraukekab
                      </div>
                    </div>
                  </a>

                  <a
                    href="https://youtube.com/@meraukekab"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                  >
                    <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                      <Youtube className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">YouTube</div>
                      <div className="text-xs text-muted-foreground">
                        Pemkab Merauke
                      </div>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <Card className="border-0 shadow-lg bg-primary/5">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Perlu Bantuan Cepat?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Untuk pertanyaan mendesak, hubungi hotline kami
                </p>
                <a
                  href="tel:+62971321015"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <Phone className="h-4 w-4" />
                  (0971) 321 015
                </a>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
