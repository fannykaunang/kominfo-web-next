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

// SKPD Data (In production, this would come from database)
const skpdData = [
  {
    id: 1,
    nama: "Sekretariat Daerah",
    singkatan: "SETDA",
    kategori: "Sekretariat",
    alamat: "Jl. Raya Mandala No. 1, Merauke",
    telepon: "(0971) 321 015",
    email: "setda@meraukekab.go.id",
    website: "https://setda.meraukekab.go.id",
    kepala: "Dr. H. Abdul Malik, S.Sos., M.Si",
  },
  {
    id: 2,
    nama: "Dinas Pendidikan dan Kebudayaan",
    singkatan: "DISDIKBUD",
    kategori: "Dinas",
    alamat: "Jl. Pendidikan No. 5, Merauke",
    telepon: "(0971) 321 234",
    email: "disdikbud@meraukekab.go.id",
    website: "https://disdikbud.meraukekab.go.id",
    kepala: "Drs. Budi Santoso, M.Pd",
  },
  {
    id: 3,
    nama: "Dinas Kesehatan",
    singkatan: "DINKES",
    kategori: "Dinas",
    alamat: "Jl. Kesehatan No. 10, Merauke",
    telepon: "(0971) 321 456",
    email: "dinkes@meraukekab.go.id",
    website: "https://dinkes.meraukekab.go.id",
    kepala: "dr. Siti Nurhaliza, M.Kes",
  },
  {
    id: 4,
    nama: "Dinas Pekerjaan Umum dan Penataan Ruang",
    singkatan: "PUPR",
    kategori: "Dinas",
    alamat: "Jl. Ahmad Yani No. 15, Merauke",
    telepon: "(0971) 321 567",
    email: "pupr@meraukekab.go.id",
    website: "https://pupr.meraukekab.go.id",
    kepala: "Ir. Agus Wijaya, M.T",
  },
  {
    id: 5,
    nama: "Dinas Sosial",
    singkatan: "DINSOS",
    kategori: "Dinas",
    alamat: "Jl. Sosial No. 8, Merauke",
    telepon: "(0971) 321 678",
    email: "dinsos@meraukekab.go.id",
    website: "https://dinsos.meraukekab.go.id",
    kepala: "Dra. Ani Suryani, M.Si",
  },
  {
    id: 6,
    nama: "Dinas Perhubungan",
    singkatan: "DISHUB",
    kategori: "Dinas",
    alamat: "Jl. Transportasi No. 20, Merauke",
    telepon: "(0971) 321 789",
    email: "dishub@meraukekab.go.id",
    website: "https://dishub.meraukekab.go.id",
    kepala: "Ir. Bambang Priyanto, M.T",
  },
  {
    id: 7,
    nama: "Dinas Pertanian dan Ketahanan Pangan",
    singkatan: "DISTAN",
    kategori: "Dinas",
    alamat: "Jl. Pertanian No. 12, Merauke",
    telepon: "(0971) 321 890",
    email: "distan@meraukekab.go.id",
    website: "https://distan.meraukekab.go.id",
    kepala: "Ir. Hadi Suprapto, M.P",
  },
  {
    id: 8,
    nama: "Dinas Lingkungan Hidup",
    singkatan: "DLH",
    kategori: "Dinas",
    alamat: "Jl. Lingkungan No. 7, Merauke",
    telepon: "(0971) 321 901",
    email: "dlh@meraukekab.go.id",
    website: "https://dlh.meraukekab.go.id",
    kepala: "Dr. Siti Maryam, M.Si",
  },
  {
    id: 9,
    nama: "Dinas Kependudukan dan Pencatatan Sipil",
    singkatan: "DISDUKCAPIL",
    kategori: "Dinas",
    alamat: "Jl. Kependudukan No. 3, Merauke",
    telepon: "(0971) 322 012",
    email: "disdukcapil@meraukekab.go.id",
    website: "https://disdukcapil.meraukekab.go.id",
    kepala: "Drs. Joko Widodo, M.Si",
  },
  {
    id: 10,
    nama: "Dinas Pariwisata dan Ekonomi Kreatif",
    singkatan: "DISPAR",
    kategori: "Dinas",
    alamat: "Jl. Wisata No. 18, Merauke",
    telepon: "(0971) 322 123",
    email: "dispar@meraukekab.go.id",
    website: "https://dispar.meraukekab.go.id",
    kepala: "Dra. Lestari Wulandari, M.Par",
  },
  {
    id: 11,
    nama: "Badan Perencanaan Pembangunan Daerah",
    singkatan: "BAPPEDA",
    kategori: "Badan",
    alamat: "Jl. Perencanaan No. 2, Merauke",
    telepon: "(0971) 322 234",
    email: "bappeda@meraukekab.go.id",
    website: "https://bappeda.meraukekab.go.id",
    kepala: "Dr. Muhammad Rizki, S.E., M.M",
  },
  {
    id: 12,
    nama: "Badan Pengelola Keuangan dan Aset Daerah",
    singkatan: "BPKAD",
    kategori: "Badan",
    alamat: "Jl. Keuangan No. 4, Merauke",
    telepon: "(0971) 322 345",
    email: "bpkad@meraukekab.go.id",
    website: "https://bpkad.meraukekab.go.id",
    kepala: "Drs. Supriyanto, M.M., Ak",
  },
  {
    id: 13,
    nama: "Badan Kepegawaian dan Pengembangan SDM",
    singkatan: "BKPSDM",
    kategori: "Badan",
    alamat: "Jl. Kepegawaian No. 6, Merauke",
    telepon: "(0971) 322 456",
    email: "bkpsdm@meraukekab.go.id",
    website: "https://bkpsdm.meraukekab.go.id",
    kepala: "Dra. Hj. Nurhayati, M.Si",
  },
  {
    id: 14,
    nama: "Inspektorat Daerah",
    singkatan: "INSPEKTORAT",
    kategori: "Inspektorat",
    alamat: "Jl. Pengawasan No. 9, Merauke",
    telepon: "(0971) 322 567",
    email: "inspektorat@meraukekab.go.id",
    website: "https://inspektorat.meraukekab.go.id",
    kepala: "Dr. H. Ahmad Yani, S.H., M.H",
  },
  {
    id: 15,
    nama: "Satuan Polisi Pamong Praja",
    singkatan: "SATPOL PP",
    kategori: "Satuan",
    alamat: "Jl. Ketertiban No. 11, Merauke",
    telepon: "(0971) 322 678",
    email: "satpolpp@meraukekab.go.id",
    website: "https://satpolpp.meraukekab.go.id",
    kepala: "Drs. Eko Prasetyo, M.Si",
  },
];

export default function SKPDPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategori, setSelectedKategori] = useState<string>("all");

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(skpdData.map((s) => s.kategori)));
    return ["all", ...cats];
  }, []);

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
  }, [searchQuery, selectedKategori]);

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
          <span className="text-foreground font-medium">Daftar SKPD</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
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
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search & Filter */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Cari SKPD..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedKategori(cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                          selectedKategori === cat
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {cat === "all" ? "Semua" : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results Count */}
                <div className="mt-4 text-sm text-muted-foreground">
                  Menampilkan {filteredSKPD.length} dari {skpdData.length} SKPD
                </div>
              </CardContent>
            </Card>

            {/* SKPD List */}
            <div className="space-y-4">
              {filteredSKPD.length > 0 ? (
                filteredSKPD.map((skpd) => (
                  <Card key={skpd.id} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Icon */}
                        <div className="shrink-0">
                          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-primary" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="mb-3">
                            <div className="flex flex-wrap items-start gap-2 mb-2">
                              <h3 className="text-lg font-bold">{skpd.nama}</h3>
                              <Badge variant="secondary">
                                {skpd.singkatan}
                              </Badge>
                              <Badge variant="outline">{skpd.kategori}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Kepala: {skpd.kepala}
                            </p>
                          </div>

                          {/* Info Grid */}
                          <div className="grid sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">
                                {skpd.alamat}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                              <a
                                href={`tel:${skpd.telepon}`}
                                className="text-primary hover:underline"
                              >
                                {skpd.telepon}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                              <a
                                href={`mailto:${skpd.email}`}
                                className="text-primary hover:underline truncate"
                              >
                                {skpd.email}
                              </a>
                            </div>
                            {skpd.website && (
                              <div className="flex items-center gap-2">
                                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                                <a
                                  href={skpd.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline truncate"
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
                ))
              ) : (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
            </div>
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
                <Building2 className="h-10 w-10 text-primary mx-auto mb-3" />
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
