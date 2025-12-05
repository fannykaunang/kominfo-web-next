import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import SliderClient from "./_client";

export const metadata = {
  title: "Kelola Slider | Admin",
  description: "Kelola slider yang tampil pada halaman utama",
};

function SliderSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[120px]" />
        ))}
      </div>
      <Skeleton className="h-[400px]" />
    </div>
  );
}

export default function SliderPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Kelola Slider</h1>
        <p className="text-muted-foreground mt-2">
          Kelola konten slider yang tampil pada halaman utama.
        </p>
      </div>

      <Suspense fallback={<SliderSkeleton />}>
        <SliderClient />
      </Suspense>
    </div>
  );
}
