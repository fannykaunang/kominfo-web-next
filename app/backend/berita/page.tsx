// app/backend/berita/page.tsx

import { Suspense } from "react";
import { BeritaRepository } from "@/lib/models/berita.model";
import { getAllKategori } from "@/lib/models/kategori.model";
import BeritaClient from "./_client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default async function BeritaPage() {
  // Fetch initial data on server
  const [beritaResult, stats, kategoriList] = await Promise.all([
    BeritaRepository.findAll({ page: 1, limit: 10 }),
    BeritaRepository.getStats(),
    getAllKategori(),
  ]);

  return (
    <Suspense fallback={<BeritaPageSkeleton />}>
      <BeritaClient
        initialBerita={beritaResult}
        initialStats={stats}
        kategoriList={kategoriList}
      />
    </Suspense>
  );
}

function BeritaPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters skeleton */}
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      {/* Table skeleton */}
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
