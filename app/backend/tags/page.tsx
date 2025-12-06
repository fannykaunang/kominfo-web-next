import { Metadata } from "next";
import { TagsClient } from "./_client";

export const metadata: Metadata = {
  title: "Kelola Tags - Admin Panel",
  description: "Kelola tags untuk berita",
};

export default function TagsPage() {
  return (
    <div className="space-y-6">
      {/* Client Component */}
      <TagsClient />
    </div>
  );
}
