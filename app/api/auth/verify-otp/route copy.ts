import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOTP } from "@/lib/otp";
import { logLoginAttempt, getClientIp, getUserAgent } from "@/lib/rate-limit";
import { execute, queryOne } from "@/lib/db-helpers";
import { User } from "@/lib/types";
import { cookies } from "next/headers";
import { encode } from "@auth/core/jwt";

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function POST(request: NextRequest) {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const body = await request.json();
    const validation = otpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const { email, otp } = validation.data;

    // Verify OTP
    const otpResult = await verifyOTP(email, otp, "login");

    if (!otpResult.success) {
      await logLoginAttempt({
        email,
        ipAddress,
        userAgent,
        success: false,
        failureReason: `Invalid OTP: ${otpResult.error}`,
      });

      return NextResponse.json(
        { error: otpResult.error || "Kode OTP tidak valid" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await queryOne<User>(
      `SELECT id, name, email, role, avatar FROM users WHERE email = ?`,
      [email]
    );

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Create session token manually
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new Error("NEXTAUTH_SECRET is not defined");
    }

    // Determine cookie name first
    const secureCookie = process.env.NODE_ENV === "production";
    const cookieName = secureCookie
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

    const token = await encode({
      token: {
        sub: user.id,
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.avatar,
      },
      secret,
      salt: cookieName,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // Set session cookie
    const cookieStore = await cookies();

    cookieStore.set(cookieName, token, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    // Log successful login
    await logLoginAttempt({
      email,
      ipAddress,
      userAgent,
      success: true,
    });

    // Update last login time
    await execute(`UPDATE users SET last_login_at = NOW() WHERE email = ?`, [
      email,
    ]);

    return NextResponse.json({
      message: "Login berhasil",
      redirectUrl: "/backend/dashboard",
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    await logLoginAttempt({
      email: null,
      ipAddress,
      userAgent,
      success: false,
      failureReason: "Server error",
    });

    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
