// app/backend/log-aktivitas/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { LogClient } from "./_client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getLogs, getLogStats, getLogFilters } from "@/lib/models/log.model";

export const metadata: Metadata = {
  title: "Log Aktivitas - Admin Panel",
  description: "Monitor semua aktivitas pengguna di sistem",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LogAktivitasPage({ searchParams }: PageProps) {
  // Await searchParams (Next.js 15 requirement pattern)
  const resolvedSearchParams = await searchParams;

  const page = Number(resolvedSearchParams.page) || 1;
  const search = (resolvedSearchParams.search as string) || "";
  const modul = (resolvedSearchParams.modul as string) || "all";
  const aksi = (resolvedSearchParams.aksi as string) || "all";

  // Fetch all data in parallel
  const [stats, filters, pageData] = await Promise.all([
    getLogStats(),
    getLogFilters(),
    getLogs({
      page,
      limit: 20,
      search,
      modul,
      aksi,
    }),
  ]);

  // Update stats.filtered with current query total if search exists
  const finalStats = {
    ...stats,
    filtered: pageData.total,
  };

  return (
    <Suspense fallback={<LogPageSkeleton />}>
      <div className="container mx-auto py-6 px-4">
        <LogClient
          initialStats={finalStats}
          initialLogs={pageData.logs}
          initialFilters={filters}
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

function LogPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
