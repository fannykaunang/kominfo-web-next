import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { auth } from "@/lib/auth"
import { queryOne, execute, generateUUID } from "@/lib/db-helpers"

const registerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["ADMIN", "EDITOR", "AUTHOR"]),
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is admin
    if ((session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Hanya admin yang dapat membuat user baru" },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, role } = validation.data

    // Check if email already exists
    const existingUser = await queryOne(
      `SELECT id FROM users WHERE email = ?`,
      [email]
    )

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const userId = generateUUID()
    await execute(
      `INSERT INTO users (id, name, email, password, role, is_active) 
       VALUES (?, ?, ?, ?, ?, 1)`,
      [userId, name, email, hashedPassword, role]
    )

    return NextResponse.json({
      message: "User berhasil dibuat",
      user: {
        id: userId,
        name,
        email,
        role,
      },
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
