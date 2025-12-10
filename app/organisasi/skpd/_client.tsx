// app/organisasi/skpd/_client.tsx

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Home,
  ChevronRight,
  Building2,
  Mail,
  Phone,
  ExternalLink,
  Search,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SKPD } from "@/lib/types";

interface SKPDContentProps {
  skpdData: SKPD[];
}

export default function SKPDContent({ skpdData }: SKPDContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategori, setSelectedKategori] = useState<string>("all");

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(skpdData.map((s) => s.kategori)));
    return ["all", ...cats.sort()];
  }, [skpdData]);

  // Filter SKPD based on search and category
  const filteredSKPD = useMemo(() => {
    return skpdData.filter((skpd) => {
      const matchSearch =
        skpd.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skpd.singkatan.toLowerCase().includes(searchQuery.toLowerCase());

      const matchKategori =
        selectedKategori === "all" || skpd.kategori === selectedKategori;

      return matchSearch && matchKategori;
    });
  }, [skpdData, searchQuery, selectedKategori]);

  return (
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
          <span className="text-foreground font-medium">Daftar SKPD</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Satuan Kerja Perangkat Daerah (SKPD)
          </h1>

          <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
            <p className="text-muted-foreground italic">
              Daftar lengkap Satuan Kerja Perangkat Daerah (SKPD) Kabupaten
              Merauke beserta informasi kontak dan pejabat yang bertanggung
              jawab.
            </p>
          </div>
        </header>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search & Filter */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <label htmlFor="search-skpd" className="sr-only">
                      Cari SKPD
                    </label>
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="search-skpd"
                      type="search"
                      placeholder="Cari SKPD..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      aria-label="Cari SKPD berdasarkan nama atau singkatan"
                    />
                  </div>

                  {/* Category Filter */}
                  <div
                    className="flex gap-2 overflow-x-auto pb-2"
                    role="group"
                    aria-label="Filter kategori SKPD"
                  >
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedKategori(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                          selectedKategori === cat
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                        aria-pressed={selectedKategori === cat}
                      >
                        {cat === "all" ? "Semua" : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results Count */}
                <div
                  className="mt-4 text-sm text-muted-foreground"
                  role="status"
                  aria-live="polite"
                >
                  Menampilkan {filteredSKPD.length} dari {skpdData.length} SKPD
                </div>
              </CardContent>
            </Card>

            {/* SKPD List */}
            <section className="space-y-4" aria-label="Daftar SKPD">
              {filteredSKPD.length > 0 ? (
                filteredSKPD.map((skpd) => (
                  <article
                    key={skpd.id}
                    itemScope
                    itemType="https://schema.org/GovernmentOrganization"
                  >
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                          {/* Icon */}
                          <div className="shrink-0">
                            <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Building2
                                className="h-8 w-8 text-primary"
                                aria-hidden="true"
                              />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="mb-3">
                              <div className="flex flex-wrap items-start gap-2 mb-2">
                                <h2
                                  className="text-lg font-bold"
                                  itemProp="name"
                                >
                                  {skpd.nama}
                                </h2>
                                <Badge
                                  variant="secondary"
                                  itemProp="alternateName"
                                >
                                  {skpd.singkatan}
                                </Badge>
                                <Badge variant="outline">{skpd.kategori}</Badge>
                              </div>
                              {skpd.kepala && (
                                <p
                                  className="text-sm text-muted-foreground"
                                  itemProp="employee"
                                  itemScope
                                  itemType="https://schema.org/Person"
                                >
                                  Kepala:{" "}
                                  <span itemProp="name">{skpd.kepala}</span>
                                </p>
                              )}
                            </div>

                            {/* Description */}
                            {skpd.deskripsi && (
                              <p
                                className="text-sm text-muted-foreground mb-3"
                                itemProp="description"
                              >
                                {skpd.deskripsi}
                              </p>
                            )}

                            {/* Info Grid */}
                            <div className="grid sm:grid-cols-2 gap-3 text-sm">
                              {skpd.alamat && (
                                <div
                                  className="flex items-start gap-2"
                                  itemProp="address"
                                  itemScope
                                  itemType="https://schema.org/PostalAddress"
                                >
                                  <MapPin
                                    className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5"
                                    aria-hidden="true"
                                  />
                                  <address
                                    className="text-muted-foreground not-italic"
                                    itemProp="streetAddress"
                                  >
                                    {skpd.alamat}
                                  </address>
                                </div>
                              )}
                              {skpd.telepon && (
                                <div className="flex items-center gap-2">
                                  <Phone
                                    className="h-4 w-4 text-muted-foreground shrink-0"
                                    aria-hidden="true"
                                  />
                                  <a
                                    href={`tel:${skpd.telepon.replace(
                                      /\s/g,
                                      ""
                                    )}`}
                                    className="text-primary hover:underline"
                                    itemProp="telephone"
                                  >
                                    {skpd.telepon}
                                  </a>
                                </div>
                              )}
                              {skpd.email && (
                                <div className="flex items-center gap-2">
                                  <Mail
                                    className="h-4 w-4 text-muted-foreground shrink-0"
                                    aria-hidden="true"
                                  />
                                  <a
                                    href={`mailto:${skpd.email}`}
                                    className="text-primary hover:underline truncate"
                                    itemProp="email"
                                  >
                                    {skpd.email}
                                  </a>
                                </div>
                              )}
                              {skpd.website && (
                                <div className="flex items-center gap-2">
                                  <ExternalLink
                                    className="h-4 w-4 text-muted-foreground shrink-0"
                                    aria-hidden="true"
                                  />
                                  <a
                                    href={skpd.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline truncate"
                                    itemProp="url"
                                  >
                                    Website
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </article>
                ))
              ) : (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <Building2
                      className="h-12 w-12 text-muted-foreground mx-auto mb-4"
                      aria-hidden="true"
                    />
                    <h3 className="text-lg font-semibold mb-2">
                      SKPD Tidak Ditemukan
                    </h3>
                    <p className="text-muted-foreground">
                      Tidak ada SKPD yang sesuai dengan pencarian Anda. Coba
                      kata kunci lain atau reset filter.
                    </p>
                  </CardContent>
                </Card>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Statistics */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Statistik SKPD</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total SKPD
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {skpdData.length}
                  </span>
                </div>
                <div className="pt-3 border-t space-y-2">
                  {categories
                    .filter((c) => c !== "all")
                    .map((cat) => {
                      const count = skpdData.filter(
                        (s) => s.kategori === cat
                      ).length;
                      return (
                        <div
                          key={cat}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-muted-foreground">{cat}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Informasi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Satuan Kerja Perangkat Daerah (SKPD) adalah organisasi atau
                  lembaga pada pemerintah daerah yang bertanggung jawab kepada
                  Bupati dalam rangka penyelenggaraan pemerintahan daerah.
                </p>
                <p>
                  Untuk informasi lebih detail mengenai tugas dan fungsi
                  masing-masing SKPD, silakan kunjungi website resmi atau
                  hubungi kontak yang tertera.
                </p>
              </CardContent>
            </Card>

            {/* Contact CTA */}
            <Card className="border-0 shadow-lg bg-primary/5">
              <CardContent className="p-6 text-center">
                <Building2
                  className="h-10 w-10 text-primary mx-auto mb-3"
                  aria-hidden="true"
                />
                <h3 className="font-semibold mb-2">Perlu Informasi SKPD?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Hubungi Bagian Organisasi Setda untuk informasi lebih lanjut
                </p>
                <a
                  href="mailto:setda@meraukekab.go.id"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <Mail className="h-4 w-4" />
                  Hubungi Kami
                </a>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
