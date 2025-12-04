import { Metadata } from "next";
import SessionsClient from "./_client";

export const metadata: Metadata = {
  title: "Kelola Sesi - Admin Panel",
  description: "Monitoring dan kelola sesi user aktif",
};

export default function SessionsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Kelola Sesi
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Monitoring sesi aktif dan kick user yang mencurigakan
        </p>
      </div>

      {/* Client Component */}
      <SessionsClient />
    </div>
  );
}
