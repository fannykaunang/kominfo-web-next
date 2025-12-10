// app/backend/skpd/page.tsx

import { getAllSKPD, getSKPDCountByKategori } from "@/lib/models/skpd.model";
import SKPDClient from "./_client";

export const metadata = {
  title: "Kelola SKPD | Backend",
  description: "Kelola Satuan Kerja Perangkat Daerah",
};

export default async function SKPDPage() {
  // Fetch SKPD data
  const skpdList = await getAllSKPD();
  const countByKategori = await getSKPDCountByKategori();

  // Calculate stats
  const stats = {
    total: skpdList.length,
    setda: countByKategori.find((c) => c.kategori === "Setda")?.jumlah || 0,
    sekretariat_dprd:
      countByKategori.find((c) => c.kategori === "Sekretariat DPRD")?.jumlah ||
      0,
    dinas: countByKategori.find((c) => c.kategori === "Dinas")?.jumlah || 0,
    lembaga_teknis:
      countByKategori.find((c) => c.kategori === "Lembaga Teknis")?.jumlah || 0,
    uptd: countByKategori.find((c) => c.kategori === "UPTD")?.jumlah || 0,
    satuan: countByKategori.find((c) => c.kategori === "Satuan")?.jumlah || 0,
    distrik: countByKategori.find((c) => c.kategori === "Distrik")?.jumlah || 0,
    kelurahan:
      countByKategori.find((c) => c.kategori === "Kelurahan")?.jumlah || 0,
  };

  return <SKPDClient initialSKPD={skpdList} initialStats={stats} />;
}
