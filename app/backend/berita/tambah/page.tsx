// app/backend/berita/tambah/page.ts

import { getAllKategori } from "@/lib/models/kategori.model";
import BeritaForm from "../berita-form";

export default async function TambahBeritaPage() {
  const kategoriList = await getAllKategori();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tambah Berita Baru
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Buat berita baru untuk website
        </p>
      </div>

      <BeritaForm kategoriList={kategoriList} />
    </div>
  );
}
