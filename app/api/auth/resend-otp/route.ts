import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createAndSendOTP } from "@/lib/otp"

const resendSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = resendSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Email tidak valid" },
        { status: 400 }
      )
    }

    const { email } = validation.data

    // Send new OTP
    const otpResult = await createAndSendOTP(email, "login")

    if (!otpResult.success) {
      return NextResponse.json(
        { error: otpResult.error || "Gagal mengirim kode OTP" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Kode OTP baru telah dikirim",
    })
  } catch (error) {
    console.error("Resend OTP error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
