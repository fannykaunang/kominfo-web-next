import { NextRequest, NextResponse } from "next/server";
import { decode } from "@auth/core/jwt";
import { queryOne } from "@/lib/db-helpers";

// Force Node.js runtime (not Edge)
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ kicked: false });
    }

    // Decode JWT to get user_id
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("NEXTAUTH_SECRET not set");
      return NextResponse.json({ kicked: false });
    }

    const cookieName =
      process.env.NODE_ENV === "production"
        ? "__Secure-authjs.session-token"
        : "authjs.session-token";

    const decoded = await decode({
      token,
      secret,
      salt: cookieName,
    });

    if (!decoded || !decoded.id) {
      return NextResponse.json({ kicked: false });
    }

    const userId = decoded.id as string;

    // ✅ Check if user was kicked (user_kicks table)
    const kicked = await queryOne(
      `SELECT id FROM user_kicks 
       WHERE user_id = ? AND expires_at > NOW()
       LIMIT 1`,
      [userId]
    );

    return NextResponse.json({
      kicked: !!kicked,
      userId: userId, // For debugging
    });
  } catch (error) {
    console.error("Check session error:", error);
    // Return false on error (don't block users)
    return NextResponse.json({ kicked: false });
  }
}
