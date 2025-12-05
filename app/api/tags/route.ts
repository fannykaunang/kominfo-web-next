import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getTags,
  getTagStats,
  createTag,
  tagNameExists,
} from "@/lib/models/tag.model";

// Helper to get client IP
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return "Unknown";
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Get stats
    if (searchParams.get("stats") === "true") {
      const stats = await getTagStats();
      return NextResponse.json(stats);
    }

    // Get tags list
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("start_date") || "";
    const endDate = searchParams.get("end_date") || "";
    const used = searchParams.get("used") || "all";

    const { tags, total } = await getTags({
      page,
      limit,
      search,
      start_date: startDate,
      end_date: endDate,
      used,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      tags,
      currentPage: page,
      totalPages,
      total,
      limit,
    });
  } catch (error) {
    console.error("Get tags error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { nama } = body;

    // Validation
    if (!nama || typeof nama !== "string" || nama.trim().length === 0) {
      return NextResponse.json(
        { error: "Nama tag harus diisi" },
        { status: 400 }
      );
    }

    if (nama.length > 255) {
      return NextResponse.json(
        { error: "Nama tag maksimal 255 karakter" },
        { status: 400 }
      );
    }

    // Check if name exists
    const exists = await tagNameExists(nama.trim());
    if (exists) {
      return NextResponse.json(
        { error: "Tag dengan nama ini sudah ada" },
        { status: 400 }
      );
    }

    // Create tag
    const tag = await createTag({
      nama: nama.trim(),
      userId: session.user.id,
      userName: session.user.name || "Unknown",
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error("Create tag error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
