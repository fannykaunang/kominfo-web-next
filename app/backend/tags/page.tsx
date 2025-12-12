// app/backend/tags/page.tsx

import { Suspense } from "react";
import type { Metadata } from "next";
import { TagsClient } from "./_client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTagStats, getTags } from "@/lib/models/tag.model";

export const metadata: Metadata = {
  title: "Kelola Tags - Admin Panel",
  description: "Kelola tags untuk berita",
};

export default async function TagsPage() {
  const [stats, pageData] = await Promise.all([
    getTagStats(),
    getTags({
      page: 1,
      limit: 20,
      search: "",
      used: "all",
      sort: "default",
    }),
  ]);

  return (
    <Suspense fallback={<TagsPageSkeleton />}>
      <div className="container mx-auto py-6 px-4">
        <TagsClient
          initialStats={stats}
          initialTags={pageData.tags}
          initialPagination={{
            currentPage: pageData.currentPage,
            totalPages: pageData.totalPages,
            total: pageData.total,
            limit: pageData.limit,
          }}
        />
      </div>
    </Suspense>
  );
}

function TagsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
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
