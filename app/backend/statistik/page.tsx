import { Suspense } from "react";
import { StatistikRepository } from "@/lib/models/statistik.model";
import { Skeleton } from "@/components/ui/skeleton";
import StatistikClient from "./_client";

export const metadata = {
  title: "Kelola Statistik | Admin",
  description: "Kelola data statistik pada website",
};

function StatistikSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[120px]" />
        ))}
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-[500px] w-full" />
    </div>
  );
}

export default async function StatistikPage() {
  const initialStatistik = await StatistikRepository.findAll();
  const initialHighlights = initialStatistik.slice(0, 4);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Kelola Statistik</h1>
        <p className="text-muted-foreground mt-2">
          Kelola data statistik yang ditampilkan pada website.
        </p>
      </div>

      <Suspense fallback={<StatistikSkeleton />}>
        <StatistikClient
          initialStatistik={initialStatistik}
          initialHighlights={initialHighlights}
        />
      </Suspense>
    </div>
  );
}
