import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  getAllUsers,
  getUserStats,
  createUser,
  emailExists,
} from "@/lib/models/user.model"
import { UserCreateInput } from "@/lib/types"

// GET - List users with filters or stats
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only ADMIN can manage users
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const isStats = searchParams.get("stats") === "true"

    // Return stats
    if (isStats) {
      const stats = await getUserStats()
      return NextResponse.json(stats)
    }

    // Return paginated list
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || undefined
    const role = searchParams.get("role") as "ADMIN" | "EDITOR" | "AUTHOR" | undefined
    const is_active = searchParams.get("is_active") || undefined
    const email_verified = searchParams.get("email_verified") || undefined

    const result = await getAllUsers(
      { search, role, is_active, email_verified },
      page,
      limit
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("GET /api/backend/users error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    )
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only ADMIN can create users
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    // Validation
    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const exists = await emailExists(body.email)
    if (exists) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    // Validate role
    if (!["ADMIN", "EDITOR", "AUTHOR"].includes(body.role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be ADMIN, EDITOR, or AUTHOR" },
        { status: 400 }
      )
    }

    // Validate password length
    if (body.password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const userData: UserCreateInput = {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      password: body.password,
      role: body.role,
      avatar: body.avatar || null,
    }

    const userId = await createUser(userData, session.user.id)

    return NextResponse.json(
      { message: "User created successfully", id: userId },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("POST /api/backend/users error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    )
  }
}