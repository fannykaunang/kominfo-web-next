// app/api/menu/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMenuById, updateMenu, deleteMenu } from "@/lib/models/menu.model";

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
    const menu = await getMenuById(id);

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

// PUT - Update menu
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
    const { nama, slug, icon, urutan, is_published, deskripsi } = body;

    // Check if menu exists
    const menu = await getMenuById(id);
    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    await updateMenu(
      id,
      {
        nama,
        slug,
        icon,
        urutan,
        is_published,
        deskripsi,
      },
      session.user.id
    );

    return NextResponse.json({ message: "Menu berhasil diupdate" });
  } catch (error: any) {
    console.error("Error updating menu:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update menu" },
      { status: 500 }
    );
  }
}

// DELETE - Delete menu
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

    // Check if menu exists
    const menu = await getMenuById(id);
    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    await deleteMenu(id, session.user.id);

    return NextResponse.json({ message: "Menu berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting menu:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete menu" },
      { status: 500 }
    );
  }
}
