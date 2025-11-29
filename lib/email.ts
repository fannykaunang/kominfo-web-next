import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Create email transporter
 */
function createTransporter(): Transporter {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "mail.merauke.go.id",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // false untuk port 587 (STARTTLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    },
    debug: true,
    logger: true,
  });
}

/**
 * Send email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || "Portal Berita Merauke"}" <${
        process.env.SMTP_FROM || process.env.SMTP_USER
      }>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email server is ready");
    return true;
  } catch (error) {
    console.error("❌ Email server error:", error);
    return false;
  }
}
