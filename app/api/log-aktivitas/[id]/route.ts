// app/api/log-aktivitas/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { execute } from "@/lib/db-helpers";
import { getLogById } from "@/lib/models/log.model";

type Props = {
  params: Promise<{ id: string }>;
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

export async function DELETE(request: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can delete logs
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await execute(`DELETE FROM log_aktivitas WHERE id = ?`, [params.id]);

    return NextResponse.json({ message: "Log deleted successfully" });
  } catch (error) {
    console.error("Delete log error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
