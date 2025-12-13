// app/backend/newsletter/page.tsx

import { Suspense } from "react";
import type { Metadata } from "next";
import { NewsletterClient } from "./_client";
import {
  getNewsletters,
  getNewsletterStats,
} from "@/lib/models/newsletter.model";

export const metadata: Metadata = {
  title: "Kelola Newsletter - Admin Panel",
  description: "Kelola daftar pelanggan newsletter",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function NewsletterPage(props: PageProps) {
  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";
  const status = searchParams.status || "all";

  // Konversi filter status untuk query database
  // "active" -> 1, "inactive" -> 0, "all" -> undefined/null
  let isActiveFilter: number | undefined = undefined;
  if (status === "active") isActiveFilter = 1;
  if (status === "inactive") isActiveFilter = 0;

  // Fetch data secara paralel agar lebih cepat
  const [stats, data] = await Promise.all([
    getNewsletterStats(),
    getNewsletters({
      page,
      limit: 20,
      search,
      is_active: isActiveFilter,
    }),
  ]);

  return (
    <Suspense fallback={<div className="p-4">Loading newsletter data...</div>}>
      <div className="container mx-auto py-6 px-4">
        <NewsletterClient
          initialData={data.newsletters}
          initialStats={stats}
          initialPagination={{
            currentPage: data.currentPage,
            totalPages: data.totalPages,
            total: data.total,
          }}
        />
      </div>
    </Suspense>
  );
}
