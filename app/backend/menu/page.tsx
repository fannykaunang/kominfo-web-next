import { Suspense } from "react";
import { MenuClient } from "./_client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Kelola Menu | Admin",
  description: "Kelola menu dan halaman website",
};

function MenuSkeleton() {
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

export default function KelolaMenuPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Kelola Menu</h1>
        <p className="text-muted-foreground mt-2">
          Kelola menu navigasi dan halaman website Anda
        </p>
      </div>

      <Suspense fallback={<MenuSkeleton />}>
        <MenuClient />
      </Suspense>
    </div>
  );
}
