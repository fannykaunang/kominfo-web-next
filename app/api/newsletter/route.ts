import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createNewsletter,
  getNewsletterStats,
  getNewsletters,
} from "@/lib/models/newsletter.model";

function getClientInfo(request: NextRequest) {
  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return { ipAddress, userAgent };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const is_active = searchParams.get("is_active");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const { newsletters, total, currentPage, totalPages } =
      await getNewsletters({
        search,
        is_active: is_active !== null ? is_active : undefined,
        page,
        limit,
      });

    const stats = await getNewsletterStats();

    return NextResponse.json({
      newsletters,
      total,
      currentPage,
      totalPages,
      stats,
    });
  } catch (error) {
    console.error("Error fetching newsletters:", error);
    return NextResponse.json(
      { error: "Failed to fetch newsletters" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, is_active } = body;

    if (!email) {
      return NextResponse.json({ error: "Email harus diisi" }, { status: 400 });
    }

    const { ipAddress, userAgent } = getClientInfo(request);

    const id = await createNewsletter(
      { email, is_active },
      session.user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      id,
      message: "Newsletter berhasil ditambahkan",
    });
  } catch (error: any) {
    console.error("Error creating newsletter:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create newsletter" },
      { status: 500 }
    );
  }
}
