import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { queryOne, execute } from "@/lib/db-helpers";
import { v4 as uuidv4 } from "uuid";
import { Session } from "@/lib/types";

type Props = {
  params: Promise<{ id: string }>;
};

// Kick single session
export async function DELETE(request: NextRequest, props: Props) {
  try {
    // Await params first (Next.js 15+ requirement)
    const params = await props.params;

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const reason = body.reason || "Kicked by admin";

    // Get session info
    const sessionData = await queryOne<Session>(
      `SELECT * FROM sessions WHERE id = ?`,
      [params.id]
    );

    if (!sessionData) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // ✅ SIMPLE: Add user to user_kicks table
    const kickId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expire after 1 hour

    await execute(
      `INSERT INTO user_kicks (id, user_id, kicked_by, reason, kicked_at, expires_at)
       VALUES (?, ?, ?, ?, NOW(), ?)`,
      [kickId, sessionData.user_id, session.user.id, reason, expiresAt]
    );

    // Also mark session as inactive (for display purposes)
    await execute(`UPDATE sessions SET is_active = 0 WHERE id = ?`, [
      params.id,
    ]);

    // Add to revoked_sessions (keep for history)
    const revokedId = uuidv4();
    await execute(
      `INSERT INTO revoked_sessions (id, session_id, token_hash, user_id, revoked_by, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        revokedId,
        params.id,
        sessionData.token_hash,
        sessionData.user_id,
        session.user.id,
        reason,
      ]
    );

    console.log(
      `✅ User ${sessionData.user_id} kicked, expires at:`,
      expiresAt
    );

    return NextResponse.json({
      message: "Session kicked successfully",
      expiresAt: expiresAt,
    });
  } catch (error) {
    console.error("Kick session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Kick and ban user (kick ALL sessions)
export async function POST(request: NextRequest, props: Props) {
  try {
    const params = await props.params;

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    if (body.action !== "ban") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const reason = body.reason || "Banned by admin";

    // Get session info
    const sessionData = await queryOne<Session>(
      `SELECT * FROM sessions WHERE id = ?`,
      [params.id]
    );

    if (!sessionData) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // ✅ SIMPLE: Add user to user_kicks table
    const kickId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expire after 1 hour

    await execute(
      `INSERT INTO user_kicks (id, user_id, kicked_by, reason, kicked_at, expires_at)
       VALUES (?, ?, ?, ?, NOW(), ?)
       ON DUPLICATE KEY UPDATE 
         kicked_at = NOW(), 
         kicked_by = VALUES(kicked_by),
         reason = VALUES(reason),
         expires_at = VALUES(expires_at)`,
      [kickId, sessionData.user_id, session.user.id, reason, expiresAt]
    );

    // Mark ALL user's sessions as inactive
    await execute(`UPDATE sessions SET is_active = 0 WHERE user_id = ?`, [
      sessionData.user_id,
    ]);

    // Deactivate user account
    await execute(`UPDATE users SET is_active = 0 WHERE id = ?`, [
      sessionData.user_id,
    ]);

    console.log(
      `✅ User ${sessionData.user_id} banned, expires at:`,
      expiresAt
    );

    return NextResponse.json({
      message: "User banned and all sessions kicked successfully",
      expiresAt: expiresAt,
    });
  } catch (error) {
    console.error("Ban user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
