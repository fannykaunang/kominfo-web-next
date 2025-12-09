// app/organisasi/skpd/page.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  User,
  Home,
  ChevronRight,
  FileText,
  FolderOpen,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { getAllSKPD } from "@/lib/models/skpd.model";
import type { SKPD } from "@/lib/types";

export const metadata = {
  title:
    "SKPD - Satuan Kerja Perangkat Daerah | Portal Berita Kabupaten Merauke",
  description:
    "Daftar lengkap Satuan Kerja Perangkat Daerah (SKPD) Kabupaten Merauke",
  keywords: [
    "SKPD",
    "Satuan Kerja Perangkat Daerah",
    "Kabupaten Merauke",
    "Organisasi Perangkat Daerah",
    "OPD Merauke",
  ],
};

// Helper function untuk mendapatkan icon berdasarkan kategori
function getKategoriIcon(kategori: string) {
  switch (kategori) {
    case "Sekretariat":
      return <FileText className="h-5 w-5" />;
    case "Dinas":
      return <Building2 className="h-5 w-5" />;
    case "Badan":
      return <FolderOpen className="h-5 w-5" />;
    case "Inspektorat":
      return <Shield className="h-5 w-5" />;
    case "Satuan":
      return <Users className="h-5 w-5" />;
    default:
      return <Building2 className="h-5 w-5" />;
  }
}

// Helper function untuk warna badge kategori
function getKategoriBadgeColor(kategori: string) {
  switch (kategori) {
    case "Sekretariat":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "Dinas":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "Badan":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Inspektorat":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "Satuan":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "";
  }
}

export default async function SKPDPage() {
  // Fetch all SKPD
  const skpdList = await getAllSKPD();

  // Group SKPD by kategori
  const groupedSKPD = skpdList.reduce((acc, skpd) => {
    if (!acc[skpd.kategori]) {
      acc[skpd.kategori] = [];
    }
    acc[skpd.kategori].push(skpd);
    return acc;
  }, {} as Record<string, SKPD[]>);

  // Urutan kategori
  const kategoriOrder = [
    "Sekretariat",
    "Dinas",
    "Badan",
    "Inspektorat",
    "Satuan",
  ];

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
            href="/organisasi"
            className="hover:text-foreground transition-colors"
          >
            Organisasi
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">SKPD</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Satuan Kerja Perangkat Daerah
          </h1>
          <p className="text-muted-foreground text-lg">
            Daftar lengkap SKPD (Satuan Kerja Perangkat Daerah) Kabupaten
            Merauke
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Total SKPD
                  </p>
                  <p className="text-2xl font-bold mt-1">{skpdList.length}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {kategoriOrder.map((kategori) => {
            const count = groupedSKPD[kategori]?.length || 0;
            return (
              <Card key={kategori}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        {kategori}
                      </p>
                      <p className="text-2xl font-bold mt-1">{count}</p>
                    </div>
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        kategori === "Sekretariat"
                          ? "bg-purple-50 dark:bg-purple-900/20"
                          : kategori === "Dinas"
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : kategori === "Badan"
                          ? "bg-green-50 dark:bg-green-900/20"
                          : kategori === "Inspektorat"
                          ? "bg-orange-50 dark:bg-orange-900/20"
                          : "bg-red-50 dark:bg-red-900/20"
                      }`}
                    >
                      {getKategoriIcon(kategori)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* SKPD List by Kategori */}
        <div className="space-y-8">
          {kategoriOrder.map((kategori) => {
            const skpdInKategori = groupedSKPD[kategori] || [];
            if (skpdInKategori.length === 0) return null;

            return (
              <div key={kategori}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      kategori === "Sekretariat"
                        ? "bg-purple-50 dark:bg-purple-900/20"
                        : kategori === "Dinas"
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : kategori === "Badan"
                        ? "bg-green-50 dark:bg-green-900/20"
                        : kategori === "Inspektorat"
                        ? "bg-orange-50 dark:bg-orange-900/20"
                        : "bg-red-50 dark:bg-red-900/20"
                    }`}
                  >
                    {getKategoriIcon(kategori)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{kategori}</h2>
                    <p className="text-sm text-muted-foreground">
                      {skpdInKategori.length} SKPD
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {skpdInKategori.map((skpd) => (
                    <Card
                      key={skpd.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <Badge
                              className={getKategoriBadgeColor(kategori)}
                              variant="secondary"
                            >
                              {skpd.singkatan}
                            </Badge>
                            <CardTitle className="text-lg mt-2 line-clamp-2">
                              {skpd.nama}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {skpd.kepala && (
                          <div className="flex items-start gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Kepala
                              </p>
                              <p className="font-medium">{skpd.kepala}</p>
                            </div>
                          </div>
                        )}

                        {skpd.alamat && (
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-muted-foreground line-clamp-2">
                              {skpd.alamat}
                            </p>
                          </div>
                        )}

                        {(skpd.telepon || skpd.email || skpd.website) && (
                          <>
                            <Separator />
                            <div className="space-y-2">
                              {skpd.telepon && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {skpd.telepon}
                                  </span>
                                </div>
                              )}
                              {skpd.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                  <a
                                    href={`mailto:${skpd.email}`}
                                    className="text-primary hover:underline"
                                  >
                                    {skpd.email}
                                  </a>
                                </div>
                              )}
                              {skpd.website && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                                  <a
                                    href={skpd.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    Website
                                  </a>
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {skpd.deskripsi && (
                          <>
                            <Separator />
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {skpd.deskripsi}
                            </p>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
