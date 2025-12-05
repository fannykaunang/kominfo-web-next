// ==========================================
// CREATE/UPDATE app/backend/berita/[id]/page.tsx
// ==========================================

import { BeritaRepository } from "@/lib/models/berita.model";
import { getAllKategori } from "@/lib/models/kategori.model";
import { getAllTagsSimple } from "@/lib/models/tag.model";
import BeritaForm from "../../berita-form";
import { notFound } from "next/navigation";

interface EditBeritaPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBeritaPage({ params }: EditBeritaPageProps) {
  const { id } = await params;

  // Load berita with tags
  const berita = await BeritaRepository.findByIdWithTags(id);

  if (!berita) {
    notFound();
  }

  const kategoriList = await getAllKategori();
  const tagsList = await getAllTagsSimple();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Berita
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Edit berita: {berita.judul}
        </p>
      </div>

      <BeritaForm
        berita={berita}
        kategoriList={kategoriList}
        tagsList={tagsList}
      />
    </div>
  );
}
