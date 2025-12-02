import { Suspense } from "react";
import { HalamanClient } from "./_client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Kelola Halaman | Admin",
  description: "Kelola halaman dan konten website",
};

function HalamanSkeleton() {
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

export default function KelolaHalamanPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Kelola Halaman</h1>
        <p className="text-muted-foreground mt-2">
          Kelola konten halaman website Anda
        </p>
      </div>

      <Suspense fallback={<HalamanSkeleton />}>
        <HalamanClient />
      </Suspense>
    </div>
  );
}
