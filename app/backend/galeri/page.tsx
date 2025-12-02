import { Suspense } from "react";
import { GaleriClient } from "./_client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Kelola Galeri | Admin",
  description: "Kelola galeri foto dan video website",
};

function GaleriSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[120px]" />
        ))}
      </div>
      <Skeleton className="h-[500px]" />
    </div>
  );
}

export default function KelolaGaleriPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Kelola Galeri</h1>
        <p className="text-muted-foreground mt-2">
          Kelola galeri foto dan video website Anda
        </p>
      </div>

      <Suspense fallback={<GaleriSkeleton />}>
        <GaleriClient />
      </Suspense>
    </div>
  );
}
