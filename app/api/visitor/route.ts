// app/api/visitor/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllVisitorLogs } from "@/lib/models/visitor.model";

// GET - Get all visitor logs with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const options = {
      search: searchParams.get("search") || undefined,
      device: (searchParams.get("device") as any) || undefined,
      browser: searchParams.get("browser") || undefined,
      os: searchParams.get("os") || undefined,
      date_from: searchParams.get("date_from") || undefined,
      date_to: searchParams.get("date_to") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "50"),
    };

    const { logs, total } = await getAllVisitorLogs(options);

    return NextResponse.json({
      logs,
      total,
      page: options.page,
      limit: options.limit,
    });
  } catch (error) {
    console.error("Error fetching visitor logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch visitor logs" },
      { status: 500 }
    );
  }
}
