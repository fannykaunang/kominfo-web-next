import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { signIn } from "@/lib/auth"
import { verifyOTP } from "@/lib/otp"
import { logLoginAttempt, getClientIp, getUserAgent } from "@/lib/rate-limit"
import { execute } from "@/lib/db-helpers"

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
})

export async function POST(request: NextRequest) {
  const ipAddress = getClientIp(request)
  const userAgent = getUserAgent(request)

  try {
    const body = await request.json()
    const validation = otpSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Data tidak valid" },
        { status: 400 }
      )
    }

    const { email, otp } = validation.data

    // Verify OTP
    const otpResult = await verifyOTP(email, otp, "login")

    if (!otpResult.success) {
      await logLoginAttempt({
        email,
        ipAddress,
        userAgent,
        success: false,
        failureReason: `Invalid OTP: ${otpResult.error}`,
      })

      return NextResponse.json(
        { error: otpResult.error || "Kode OTP tidak valid" },
        { status: 401 }
      )
    }

    // OTP valid, proceed with sign in
    const result = await signIn("credentials", {
      email,
      password: "bypass", // We already verified credentials in step 1
      redirect: false,
    })

    if (result?.error) {
      await logLoginAttempt({
        email,
        ipAddress,
        userAgent,
        success: false,
        failureReason: "Sign in failed",
      })

      return NextResponse.json(
        { error: "Login gagal" },
        { status: 401 }
      )
    }

    // Log successful login
    await logLoginAttempt({
      email,
      ipAddress,
      userAgent,
      success: true,
    })

    // Update last login time
    await execute(
      `UPDATE users SET last_login_at = NOW() WHERE email = ?`,
      [email]
    )

    return NextResponse.json({
      message: "Login berhasil",
      redirectUrl: "/admin",
    })
  } catch (error) {
    console.error("OTP verification error:", error)

    await logLoginAttempt({
      email: null,
      ipAddress,
      userAgent,
      success: false,
      failureReason: "Server error",
    })

    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
