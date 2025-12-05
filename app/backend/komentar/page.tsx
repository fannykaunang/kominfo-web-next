// app/backend/komentar/page.tsx

import { Suspense } from "react";
import { KomentarRepository } from "@/lib/models/komentar.model";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import KomentarClient from "./_client";

export default async function KomentarPage() {
  const [initialKomentar, stats] = await Promise.all([
    KomentarRepository.findAll({ page: 1, limit: 10 }),
    KomentarRepository.getStats(),
  ]);

  return (
    <Suspense fallback={<KomentarPageSkeleton />}>
      <KomentarClient initialKomentar={initialKomentar} initialStats={stats} />
    </Suspense>
  );
}

function KomentarPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
