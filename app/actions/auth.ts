"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function forceLogout() {
  console.log("🔍 [forceLogout] Clearing cookie...");

  // Clear session cookie
  const cookieStore = await cookies();
  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

  cookieStore.delete(cookieName);
  console.log("🔍 [forceLogout] Cookie deleted:", cookieName);

  // Redirect to login
  redirect("/login?reason=session_revoked");
}
