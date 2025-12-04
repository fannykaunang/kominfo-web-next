import { NextRequest, NextResponse } from "next/server";
import { isSessionRevoked, hashToken } from "@/lib/models/session.model";

// Force Node.js runtime (not Edge)
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ revoked: false });
    }

    const tokenHash = hashToken(token);
    const revoked = await isSessionRevoked(tokenHash);

    return NextResponse.json({ revoked });
  } catch (error) {
    console.error("Check session error:", error);
    // Return false on error (don't block users)
    return NextResponse.json({ revoked: false });
  }
}
