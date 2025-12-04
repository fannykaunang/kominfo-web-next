import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  revokeSession,
  revokeSessionAndBanUser,
} from "@/lib/models/session.model";

type Props = {
  params: Promise<{ id: string }>;
};

// DELETE - Kick session (revoke only)
export async function DELETE(request: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can kick sessions
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const reason = body.reason || "Kicked by admin";

    await revokeSession(params.id, session.user.id, reason);

    return NextResponse.json({ message: "Session kicked successfully" });
  } catch (error: any) {
    console.error("DELETE /api/sessions/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to kick session" },
      { status: 500 }
    );
  }
}

// POST - Kick and ban user
export async function POST(request: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can ban users
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, reason } = body;

    if (action === "ban") {
      await revokeSessionAndBanUser(
        params.id,
        session.user.id,
        reason || "Banned by admin"
      );

      return NextResponse.json({
        message: "User banned and all sessions kicked successfully",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/sessions/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to ban user" },
      { status: 500 }
    );
  }
}
