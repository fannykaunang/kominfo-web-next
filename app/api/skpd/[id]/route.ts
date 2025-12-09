// app/api/skpd/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSKPDById, updateSKPD, deleteSKPD } from "@/lib/models/skpd.model";
import { SKPDInput } from "@/lib/types";

// GET - Get single SKPD by ID
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
    const skpd = await getSKPDById(parseInt(id));

    if (!skpd) {
      return NextResponse.json(
        { error: "SKPD tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(skpd);
  } catch (error) {
    console.error("Error fetching SKPD:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data SKPD" },
      { status: 500 }
    );
  }
}

// PUT - Update SKPD
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body: Partial<SKPDInput> = await request.json();

    // Validate at least one field to update
    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data yang diperbarui" },
        { status: 400 }
      );
    }

    // Get user info for logging
    const userId = session.user.id;
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      null;
    const userAgent = request.headers.get("user-agent") || null;

    const affectedRows = await updateSKPD(
      parseInt(id),
      body,
      userId,
      ipAddress || undefined,
      userAgent || undefined
    );

    if (affectedRows === 0) {
      return NextResponse.json(
        { error: "SKPD tidak ditemukan atau tidak ada perubahan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "SKPD berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating SKPD:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui SKPD" },
      { status: 500 }
    );
  }
}

// DELETE - Delete SKPD
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if SKPD exists before deleting
    const skpd = await getSKPDById(parseInt(id));
    if (!skpd) {
      return NextResponse.json(
        { error: "SKPD tidak ditemukan" },
        { status: 404 }
      );
    }

    // Get user info for logging
    const userId = session.user.id;
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      null;
    const userAgent = request.headers.get("user-agent") || null;

    // Delete SKPD (function already handles logging internally)
    await deleteSKPD(
      parseInt(id),
      userId,
      ipAddress || undefined,
      userAgent || undefined
    );

    return NextResponse.json({ message: "SKPD berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting SKPD:", error);
    return NextResponse.json(
      { error: "Gagal menghapus SKPD" },
      { status: 500 }
    );
  }
}
