import { Metadata } from "next";
import { TagsClient } from "./_client";

export const metadata: Metadata = {
  title: "Kelola Tags - Admin Panel",
  description: "Kelola tags untuk berita",
};

export default function TagsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Kelola Tags
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Kelola tags untuk berita
          </p>
        </div>
      </div>

      {/* Client Component */}
      <TagsClient />
    </div>
  );
}
