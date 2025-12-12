// app/api/log-aktivitas/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLogById, deleteLog } from "@/lib/models/log.model";

// Helper to get client info
function getClientInfo(request: NextRequest) {
  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return { ipAddress, userAgent };
}

type Props = {
  params: Promise<{ log_id: number }>;
};

// GET - Get menu by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const log = await getLogById(id);

    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    return NextResponse.json(log);
  } catch (error) {
    console.error("Error fetching Log:", error);
    return NextResponse.json({ error: "Failed to fetch Log" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can delete log
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if log exists (data sebelum)
    const before = await getLogById(id);
    if (!before) {
      return NextResponse.json(
        { error: "Log tidak ditemukan" },
        { status: 404 }
      );
    }

    const { ipAddress, userAgent } = getClientInfo(request);

    // Delete log
    await deleteLog(id, session.user.id, ipAddress, userAgent);

    return NextResponse.json({ message: "Log berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting Log:", error);
    return NextResponse.json(
      { error: "Failed to delete Log" },
      { status: 500 }
    );
  }
}
