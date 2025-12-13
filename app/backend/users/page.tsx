import { Metadata } from "next";
import UsersClient from "./_client";

export const metadata: Metadata = {
  title: "Kelola Users - Admin Panel",
  description: "Kelola users dan permissions",
};

export default function UsersPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Kelola Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Atur users, roles, dan permissions
          </p>
        </div>
      </div>

      {/* Client Component */}
      <UsersClient />
    </div>
  );
}
