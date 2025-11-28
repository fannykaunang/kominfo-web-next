import { query, queryOne, execute, generateUUID } from "./db-helpers"
import { sendEmail } from "./email"

/**
 * Generate random 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Create and send OTP to email
 */
export async function createAndSendOTP(
  email: string,
  type: "login" | "register" | "reset_password" = "login"
): Promise<{ success: boolean; error?: string }> {
  try {
    const code = generateOTP()
    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || "10")
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000)

    // Invalidate previous unused OTPs for this email
    await execute(
      `UPDATE otp_codes 
       SET is_used = 1 
       WHERE email = ? AND type = ? AND is_used = 0`,
      [email, type]
    )

    // Create new OTP
    await execute(
      `INSERT INTO otp_codes (email, code, type, expires_at) 
       VALUES (?, ?, ?, ?)`,
      [email, code, type, expiresAt]
    )

    // Send email
    const emailSent = await sendOTPEmail(email, code, type, expiryMinutes)

    if (!emailSent) {
      return { success: false, error: "Failed to send OTP email" }
    }

    return { success: true }
  } catch (error) {
    console.error("Create OTP error:", error)
    return { success: false, error: "Failed to create OTP" }
  }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(
  email: string,
  code: string,
  type: "login" | "register" | "reset_password" = "login"
): Promise<{ success: boolean; error?: string }> {
  try {
    const otp = await queryOne<{
      id: number
      expires_at: Date
      is_used: number
    }>(
      `SELECT id, expires_at, is_used 
       FROM otp_codes 
       WHERE email = ? AND code = ? AND type = ? 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [email, code, type]
    )

    if (!otp) {
      return { success: false, error: "Invalid OTP code" }
    }

    if (otp.is_used === 1) {
      return { success: false, error: "OTP already used" }
    }

    if (new Date() > new Date(otp.expires_at)) {
      return { success: false, error: "OTP expired" }
    }

    // Mark OTP as used
    await execute(`UPDATE otp_codes SET is_used = 1 WHERE id = ?`, [otp.id])

    return { success: true }
  } catch (error) {
    console.error("Verify OTP error:", error)
    return { success: false, error: "Failed to verify OTP" }
  }
}

/**
 * Send OTP email
 */
async function sendOTPEmail(
  email: string,
  code: string,
  type: string,
  expiryMinutes: number
): Promise<boolean> {
  const typeText =
    type === "login"
      ? "Login"
      : type === "register"
      ? "Registrasi"
      : "Reset Password"

  const subject = `Kode OTP ${typeText} - Portal Berita Merauke`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 30px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .otp-code {
          background: white;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #3b82f6;
          margin: 20px 0;
        }
        .warning {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 12px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">M</div>
          <h2>Portal Berita Kabupaten Merauke</h2>
        </div>
        
        <h3>Kode OTP ${typeText} Anda</h3>
        <p>Gunakan kode OTP berikut untuk melanjutkan proses ${typeText.toLowerCase()}:</p>
        
        <div class="otp-code">${code}</div>
        
        <div class="warning">
          <strong>⚠️ Penting:</strong>
          <ul style="margin: 5px 0; padding-left: 20px;">
            <li>Kode ini akan kedaluwarsa dalam <strong>${expiryMinutes} menit</strong></li>
            <li>Jangan bagikan kode ini kepada siapapun</li>
            <li>Jika Anda tidak melakukan permintaan ini, abaikan email ini</li>
          </ul>
        </div>
        
        <p>Jika Anda mengalami kesulitan, silakan hubungi administrator.</p>
        
        <div class="footer">
          <p>Email ini dikirim secara otomatis, mohon tidak membalas.</p>
          <p>&copy; ${new Date().getFullYear()} Pemerintah Kabupaten Merauke</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Kode OTP ${typeText} Anda: ${code}

Kode ini akan kedaluwarsa dalam ${expiryMinutes} menit.
Jangan bagikan kode ini kepada siapapun.

Jika Anda tidak melakukan permintaan ini, abaikan email ini.

Portal Berita Kabupaten Merauke
  `

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  })
}

/**
 * Clean up expired OTPs (run this periodically)
 */
export async function cleanupExpiredOTPs(): Promise<void> {
  try {
    await execute(`DELETE FROM otp_codes WHERE expires_at < NOW()`)
  } catch (error) {
    console.error("Cleanup OTP error:", error)
  }
}
