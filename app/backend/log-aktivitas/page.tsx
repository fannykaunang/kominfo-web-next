import { Metadata } from "next";
import { LogClient } from "./_client";

export const metadata: Metadata = {
  title: "Log Aktivitas - Admin Panel",
  description: "Monitor semua aktivitas pengguna di sistem",
};

export default function LogAktivitasPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Log Aktivitas
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Monitor semua aktivitas pengguna di sistem
          </p>
        </div>
      </div>

      {/* Client Component */}
      <LogClient />
    </div>
  );
}
