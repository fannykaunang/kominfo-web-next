import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserById,
  updateUser,
  deleteUser,
  toggleUserActive,
  verifyUserEmail,
  emailExists,
} from "@/lib/models/user.model";
import { UserUpdateInput } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
};

// Helper to get client info
function getClientInfo(request: NextRequest) {
  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return { ipAddress, userAgent };
}

// GET - Get single user
export async function GET(request: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can view other users, or user can view themselves
    if (session.user.role !== "ADMIN" && session.user.id !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await getUserById(params.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can update other users, or user can update themselves
    if (session.user.role !== "ADMIN" && session.user.id !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Check if user exists
    const existingUser = await getUserById(params.id);
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Validate email if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }

      // Check if email already exists (excluding current user)
      const exists = await emailExists(body.email, params.id);
      if (exists) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    // Validate role if provided (only ADMIN can change roles)
    if (body.role !== undefined) {
      if (session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Only admin can change user roles" },
          { status: 403 }
        );
      }

      if (!["ADMIN", "EDITOR", "AUTHOR"].includes(body.role)) {
        return NextResponse.json(
          { error: "Invalid role. Must be ADMIN, EDITOR, or AUTHOR" },
          { status: 400 }
        );
      }
    }

    // Validate password length if provided
    if (body.password && body.password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Only ADMIN can change is_active status
    if (body.is_active !== undefined && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admin can change active status" },
        { status: 403 }
      );
    }

    const updateData: UserUpdateInput = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.email !== undefined)
      updateData.email = body.email.trim().toLowerCase();
    if (body.password) updateData.password = body.password;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.avatar !== undefined) updateData.avatar = body.avatar;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const { ipAddress, userAgent } = getClientInfo(request);

    await updateUser(
      params.id,
      updateData,
      session.user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error: any) {
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can delete users
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if user exists
    const user = await getUserById(params.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting yourself
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const { ipAddress, userAgent } = getClientInfo(request);

    await deleteUser(params.id, session.user.id, ipAddress, userAgent);

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}

// PATCH - Toggle active status or verify email
export async function PATCH(request: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const session = await auth();

    const { ipAddress, userAgent } = getClientInfo(request);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can perform these actions
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    // Check if user exists
    const user = await getUserById(params.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "toggle_active") {
      // Prevent deactivating yourself
      if (params.id === session.user.id) {
        return NextResponse.json(
          { error: "Cannot deactivate your own account" },
          { status: 400 }
        );
      }

      await toggleUserActive(params.id, session.user.id, ipAddress, userAgent);
      return NextResponse.json({ message: "User status updated successfully" });
    }

    if (action === "verify_email") {
      await verifyUserEmail(params.id, session.user.id, ipAddress, userAgent);
      return NextResponse.json({ message: "Email verified successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("PATCH /api/users/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}
