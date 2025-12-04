import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllSessions, getSessionStats } from "@/lib/models/session.model";

// GET - Get all sessions or stats
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can view sessions
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    // Check if requesting stats
    if (searchParams.get("stats") === "true") {
      const stats = await getSessionStats();
      return NextResponse.json(stats);
    }

    // Get pagination params
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Get filter params
    const filters = {
      search: searchParams.get("search") || undefined,
      user_id: searchParams.get("user_id") || undefined,
      is_active: searchParams.get("is_active") || undefined,
      ip_address: searchParams.get("ip_address") || undefined,
    };

    const result = await getAllSessions(filters, page, limit);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET /api/sessions error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
