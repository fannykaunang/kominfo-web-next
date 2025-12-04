// app/backend/layout.tsx

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BackendLayoutClient } from "@/components/backend/layout-client";
import { queryOne } from "@/lib/db-helpers";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BackendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("🔍 [Layout] Starting session check...");

  // Check authentication
  const session = await auth();
  console.log(
    "🔍 [Layout] Auth check:",
    session ? "✅ Logged in" : "❌ Not logged in"
  );

  if (!session?.user) {
    console.log("🔍 [Layout] No session, redirecting to login");
    redirect("/login");
  }

  // ✅ Check if user was kicked
  let kicked = null;
  try {
    const userId = session.user.id;
    console.log("🔍 [Layout] Checking if user was kicked:", userId);

    kicked = await queryOne(
      `SELECT id FROM user_kicks 
       WHERE user_id = ? AND expires_at > NOW()
       LIMIT 1`,
      [userId]
    );

    console.log("🔍 [Layout] User kicked?", kicked ? "❌ YES" : "✅ No");
  } catch (error) {
    console.error("❌ [Layout] Error checking user kick:", error);
  }

  // ✅ Redirect to logout route (route handler can modify cookies!)
  if (kicked) {
    console.log("🔍 [Layout] Redirecting to logout route...");
    redirect("/api/auth/logout");
  }

  console.log("✅ [Layout] Session check passed, rendering page");
  return (
    <BackendLayoutClient user={session.user}>{children}</BackendLayoutClient>
  );
}
