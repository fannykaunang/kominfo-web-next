import { Suspense } from "react";
import SettingsClient from "./_client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Pengaturan Aplikasi | Admin",
  description: "Kelola pengaturan aplikasi dan backup",
};

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-[500px]" />
    </div>
  );
}

export default function PengaturanPage() {
  return (
    <div className="container mx-auto px-4">
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsClient />
      </Suspense>
    </div>
  );
}
