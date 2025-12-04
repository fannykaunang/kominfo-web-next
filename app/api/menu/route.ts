// app/api/menu/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllMenu, createMenu, getMenuStats } from "@/lib/models/menu.model";

// Helper to get client info
function getClientInfo(request: NextRequest) {
  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return { ipAddress, userAgent };
}

// GET - List all menu
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const is_published = searchParams.get("is_published");

    const options: any = { search };
    if (is_published !== null && is_published !== "") {
      options.is_published = parseInt(is_published);
    }

    const menu = await getAllMenu(options);
    const stats = await getMenuStats();

    return NextResponse.json({ menu, stats });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

// POST - Create new menu
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { nama, slug, icon, urutan, is_published, deskripsi } = body;

    // Validation
    if (!nama || !slug) {
      return NextResponse.json(
        { error: "Nama dan slug wajib diisi" },
        { status: 400 }
      );
    }

    const { ipAddress, userAgent } = getClientInfo(request);

    const id = await createMenu(
      {
        nama,
        slug,
        icon: icon || null,
        urutan: urutan || 0,
        is_published: is_published !== undefined ? is_published : 1,
        deskripsi: deskripsi || null,
      },
      session.user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json({ id, message: "Menu berhasil dibuat" });
  } catch (error: any) {
    console.error("Error creating menu:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create menu" },
      { status: 500 }
    );
  }
}
