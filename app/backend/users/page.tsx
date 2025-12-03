import { Metadata } from "next"
import UsersClient from "./_client"

export const metadata: Metadata = {
  title: "Kelola Users - Admin Panel",
  description: "Kelola users dan permissions",
}

export default function UsersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Kelola Users
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Kelola users, roles, dan permissions
        </p>
      </div>

      {/* Client Component */}
      <UsersClient />
    </div>
  )
}