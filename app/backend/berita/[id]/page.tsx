// app/backend/berita/[id]/page.tsx

import { BeritaRepository } from "@/lib/models/berita.model";
import { getAllKategori } from "@/lib/models/kategori.model";
import BeritaForm from "../berita-form";
import { notFound } from "next/navigation";

interface EditBeritaPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBeritaPage({ params }: EditBeritaPageProps) {
  const { id } = await params;

  // Load berita
  const berita = await BeritaRepository.findByIdWithTags(id);
  if (!berita) {
    notFound();
  }

  // Load kategori
  const kategoriList = await getAllKategori();

  // Load tags
  const { query } = await import("@/lib/db-helpers");
  const tagsList = await query(
    `SELECT id, nama, slug, created_at FROM tags ORDER BY nama ASC`
  );

  // Debug logs
  console.log("==========================================");
  console.log("🐛 EDIT BERITA PAGE DEBUG");
  console.log("Total Tags Available:", tagsList?.length || 0);
  console.log("Selected Tags:", berita.tag_ids);
  console.log("==========================================");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Berita Total Tags Available: {berita.tag_ids}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Update informasi berita: {berita.judul}
        </p>
      </div>

      {/* Debug Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-500 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-3xl">🐛</div>
          <div>
            <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100">
              DEBUG INFO
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white/50 dark:bg-black/20 rounded p-3">
            <p className="text-gray-600 dark:text-gray-400 text-xs">
              Total Tags
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {tagsList?.length || 0}
            </p>
          </div>
          <div className="bg-white/50 dark:bg-black/20 rounded p-3">
            <p className="text-gray-600 dark:text-gray-400 text-xs">Selected</p>
            <p className="text-2xl font-bold text-green-600">
              {berita.tag_ids?.length || 0}
            </p>
          </div>
        </div>
      </div>

      <BeritaForm
        berita={berita}
        kategoriList={kategoriList}
        tagsList={tagsList as any}
      />
    </div>
  );
}
