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
    sekretariat:
      countByKategori.find((c) => c.kategori === "Sekretariat")?.jumlah || 0,
    dinas: countByKategori.find((c) => c.kategori === "Dinas")?.jumlah || 0,
    badan: countByKategori.find((c) => c.kategori === "Badan")?.jumlah || 0,
    inspektorat:
      countByKategori.find((c) => c.kategori === "Inspektorat")?.jumlah || 0,
    satuan: countByKategori.find((c) => c.kategori === "Satuan")?.jumlah || 0,
  };

  return <SKPDClient initialSKPD={skpdList} initialStats={stats} />;
}
