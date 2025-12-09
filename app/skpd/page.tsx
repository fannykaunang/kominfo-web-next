import { Metadata } from "next";
import { getAllSKPD } from "@/lib/models/skpd.model";
import SKPDContent from "./_client";

export const metadata: Metadata = {
  title: "Daftar SKPD | Portal Berita Kabupaten Merauke",
  description:
    "Daftar lengkap Satuan Kerja Perangkat Daerah (SKPD) Kabupaten Merauke beserta informasi kontak dan pejabat yang bertanggung jawab",
  keywords: [
    "skpd merauke",
    "dinas merauke",
    "badan merauke",
    "pemerintah merauke",
    "satuan kerja",
    "perangkat daerah",
  ],
  openGraph: {
    title: "Daftar SKPD | Portal Berita Kabupaten Merauke",
    description:
      "Direktori lengkap SKPD Kabupaten Merauke dengan informasi kontak dan website resmi",
    type: "website",
  },
  alternates: {
    canonical: "/skpd",
  },
};

export default async function SKPDPage() {
  // Fetch SKPD data from database
  const skpdData = await getAllSKPD();

  return <SKPDContent skpdData={skpdData} />;
}
