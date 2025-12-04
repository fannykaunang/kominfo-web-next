import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { execute } from "@/lib/db-helpers";

export async function GET() {
  console.log("🔍 [Logout Route] Starting logout process...");

  try {
    // Get user session before clearing cookie
    const session = await auth();
    const userId = session?.user?.id;

    // ✅ Clear user_kicks record so user can login again
    if (userId) {
      console.log("🔍 [Logout Route] Clearing user_kicks for user:", userId);
      await execute(`DELETE FROM user_kicks WHERE user_id = ?`, [userId]);
      console.log("✅ [Logout Route] user_kicks cleared");
    }
  } catch (error) {
    console.error("❌ [Logout Route] Error clearing user_kicks:", error);
    // Continue with logout even if this fails
  }

  // Clear session cookie
  const cookieStore = await cookies();
  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

  cookieStore.delete(cookieName);
  console.log("✅ [Logout Route] Cookie deleted:", cookieName);

  // Redirect to login
  return NextResponse.redirect(
    new URL(
      "/login?reason=session_revoked",
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    )
  );
}
