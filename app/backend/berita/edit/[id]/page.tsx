// app/backend/berita/edit/[id]/page.ts

import { BeritaRepository } from "@/lib/models/berita.model";
import { getAllKategori } from "@/lib/models/kategori.model";
import { redirect } from "next/navigation";
import BeritaForm from "../../berita-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Berita | Web Portal",
  description: "Edit Berita",
};

export default async function EditBeritaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params in Next.js 15
  const { id } = await params;

  const [berita, kategoriList] = await Promise.all([
    BeritaRepository.findById(id),
    getAllKategori(),
  ]);

  if (!berita) {
    redirect("/backend/berita");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Berita
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Update informasi berita: {berita.judul}
        </p>
      </div>

      <BeritaForm berita={berita} kategoriList={kategoriList} />
    </div>
  );
}
