import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  html: string
  text: string
}

/**
 * Create email transporter
 */
function createTransporter() {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter()

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "Portal Berita Merauke"}" <${
        process.env.SMTP_FROM || process.env.SMTP_USER
      }>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })

    console.log("Email sent:", info.messageId)
    return true
  } catch (error) {
    console.error("Email send error:", error)
    return false
  }
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    console.log("✅ Email server is ready")
    return true
  } catch (error) {
    console.error("❌ Email server error:", error)
    return false
  }
}
