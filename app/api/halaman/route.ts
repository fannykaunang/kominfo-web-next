// app/api/halaman/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAllHalaman,
  createHalaman,
  getHalamanStats,
} from "@/lib/models/halaman.model";

// GET - List all halaman
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const menu_id = searchParams.get("menu_id") || undefined;
    const is_published = searchParams.get("is_published");

    const options: any = { search, menu_id };
    if (is_published !== null && is_published !== "") {
      options.is_published = parseInt(is_published);
    }

    const halaman = await getAllHalaman(options);
    const stats = await getHalamanStats();

    return NextResponse.json({ halaman, stats });
  } catch (error) {
    console.error("Error fetching halaman:", error);
    return NextResponse.json(
      { error: "Failed to fetch halaman" },
      { status: 500 }
    );
  }
}

// POST - Create new halaman
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      menu_id,
      judul,
      slug,
      konten,
      excerpt,
      urutan,
      is_published,
      meta_title,
      meta_description,
    } = body;

    // Validation
    if (!menu_id || !judul || !slug || !konten) {
      return NextResponse.json(
        { error: "Menu, judul, slug, dan konten wajib diisi" },
        { status: 400 }
      );
    }

    const id = await createHalaman(
      {
        menu_id,
        judul,
        slug,
        konten,
        excerpt: excerpt || null,
        urutan: urutan || 0,
        is_published: is_published !== undefined ? is_published : 1,
        meta_title: meta_title || null,
        meta_description: meta_description || null,
        author_id: session.user.id,
      },
      session.user.id
    );

    return NextResponse.json({ id, message: "Halaman berhasil dibuat" });
  } catch (error: any) {
    console.error("Error creating halaman:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create halaman" },
      { status: 500 }
    );
  }
}
