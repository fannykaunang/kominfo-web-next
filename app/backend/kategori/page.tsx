import { Suspense } from "react";
import { getAllKategori, getKategoriStats } from "@/lib/models/kategori.model";
import KategoriClient from "./_client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default async function KategoriPage() {
  // Fetch data on server
  const [kategoriList, stats] = await Promise.all([
    getAllKategori(),
    getKategoriStats(),
  ]);

  return (
    <Suspense fallback={<KategoriPageSkeleton />}>
      <KategoriClient initialKategori={kategoriList} initialStats={stats} />
    </Suspense>
  );
}

function KategoriPageSkeleton() {
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

      {/* Table skeleton */}
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
