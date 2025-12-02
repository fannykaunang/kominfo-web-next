// app/api/halaman/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getHalamanById,
  updateHalaman,
  deleteHalaman,
} from "@/lib/models/halaman.model";

// GET - Get halaman by ID
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
    const halaman = await getHalamanById(id);

    if (!halaman) {
      return NextResponse.json({ error: "Halaman not found" }, { status: 404 });
    }

    return NextResponse.json(halaman);
  } catch (error) {
    console.error("Error fetching halaman:", error);
    return NextResponse.json(
      { error: "Failed to fetch halaman" },
      { status: 500 }
    );
  }
}

// PUT - Update halaman
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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

    // Check if halaman exists
    const halaman = await getHalamanById(id);
    if (!halaman) {
      return NextResponse.json({ error: "Halaman not found" }, { status: 404 });
    }

    await updateHalaman(
      id,
      {
        menu_id,
        judul,
        slug,
        konten,
        excerpt,
        urutan,
        is_published,
        meta_title,
        meta_description,
      },
      session.user.id
    );

    return NextResponse.json({ message: "Halaman berhasil diupdate" });
  } catch (error: any) {
    console.error("Error updating halaman:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update halaman" },
      { status: 500 }
    );
  }
}

// DELETE - Delete halaman
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if halaman exists
    const halaman = await getHalamanById(id);
    if (!halaman) {
      return NextResponse.json({ error: "Halaman not found" }, { status: 404 });
    }

    await deleteHalaman(id, session.user.id);

    return NextResponse.json({ message: "Halaman berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting halaman:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete halaman" },
      { status: 500 }
    );
  }
}
