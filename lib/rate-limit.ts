import { query, execute } from "./db-helpers"

interface RateLimitOptions {
  identifier: string // IP address or user ID
  max: number // Max attempts
  windowMs: number // Time window in milliseconds
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: Date
}

/**
 * Check rate limit for login attempts
 */
export async function checkRateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { identifier, max, windowMs } = options
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowMs)

  try {
    // Count attempts within time window
    const [{ count }] = await query<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM login_attempts 
       WHERE ip_address = ? 
       AND created_at > ? 
       AND success = 0`,
      [identifier, windowStart]
    )

    const remaining = Math.max(0, max - count)
    const resetAt = new Date(now.getTime() + windowMs)

    return {
      success: count < max,
      remaining,
      resetAt,
    }
  } catch (error) {
    console.error("Rate limit check error:", error)
    // On error, allow the request
    return {
      success: true,
      remaining: max,
      resetAt: new Date(now.getTime() + windowMs),
    }
  }
}

/**
 * Log login attempt
 */
export async function logLoginAttempt(data: {
  email: string | null
  ipAddress: string
  userAgent: string | null
  success: boolean
  failureReason?: string
}): Promise<void> {
  try {
    await execute(
      `INSERT INTO login_attempts (email, ip_address, user_agent, success, failure_reason) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.email,
        data.ipAddress,
        data.userAgent,
        data.success ? 1 : 0,
        data.failureReason || null,
      ]
    )
  } catch (error) {
    console.error("Failed to log login attempt:", error)
  }
}

/**
 * Check if IP is locked out
 */
export async function isIpLockedOut(
  ipAddress: string,
  lockoutMinutes: number = 15
): Promise<boolean> {
  const lockoutThreshold = 5
  const windowStart = new Date(Date.now() - lockoutMinutes * 60 * 1000)

  try {
    const [{ count }] = await query<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM login_attempts 
       WHERE ip_address = ? 
       AND success = 0 
       AND created_at > ?`,
      [ipAddress, windowStart]
    )

    return count >= lockoutThreshold
  } catch (error) {
    console.error("Lockout check error:", error)
    return false
  }
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  // Try to get real IP from headers
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIp) {
    return realIp
  }

  // Fallback
  return "unknown"
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get("user-agent") || "unknown"
}
