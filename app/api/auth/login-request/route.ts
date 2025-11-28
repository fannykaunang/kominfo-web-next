import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { queryOne } from "@/lib/db-helpers";
import { createAndSendOTP } from "@/lib/otp";
import {
  checkRateLimit,
  logLoginAttempt,
  isIpLockedOut,
  getClientIp,
  getUserAgent,
} from "@/lib/rate-limit";
import { User } from "@/lib/types";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(request: NextRequest) {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    // Check if IP is locked out
    const lockedOut = await isIpLockedOut(ipAddress);
    if (lockedOut) {
      await logLoginAttempt({
        email: null,
        ipAddress,
        userAgent,
        success: false,
        failureReason: "IP locked out",
      });

      return NextResponse.json(
        {
          error:
            "Terlalu banyak percobaan login gagal. Akun Anda diblokir sementara. Silakan coba lagi dalam 15 menit.",
        },
        { status: 429 }
      );
    }

    // Check rate limit
    const rateLimit = await checkRateLimit({
      identifier: ipAddress,
      max: parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5"),
      windowMs: 15 * 60 * 1000, // 15 minutes
    });

    if (!rateLimit.success) {
      await logLoginAttempt({
        email: null,
        ipAddress,
        userAgent,
        success: false,
        failureReason: "Rate limit exceeded",
      });

      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan. Sisa: ${
            rateLimit.remaining
          }. Coba lagi setelah ${rateLimit.resetAt.toLocaleTimeString(
            "id-ID"
          )}`,
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Get user from database
    const user = await queryOne<User>(
      `SELECT id, name, email, password, role, is_active 
       FROM users 
       WHERE email = ?`,
      [email]
    );

    if (!user) {
      await logLoginAttempt({
        email,
        ipAddress,
        userAgent,
        success: false,
        failureReason: "Email not found",
      });

      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.is_active === 0) {
      await logLoginAttempt({
        email,
        ipAddress,
        userAgent,
        success: false,
        failureReason: "Account inactive",
      });

      return NextResponse.json(
        { error: "Akun Anda tidak aktif. Silakan hubungi administrator." },
        { status: 403 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      await logLoginAttempt({
        email,
        ipAddress,
        userAgent,
        success: false,
        failureReason: "Invalid password",
      });

      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Send OTP
    const otpResult = await createAndSendOTP(email, "login");

    if (!otpResult.success) {
      return NextResponse.json(
        { error: "Gagal mengirim kode OTP. Silakan coba lagi." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Kode OTP telah dikirim ke email Anda",
      email: email,
    });
  } catch (error) {
    console.error("Login request error:", error);

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
