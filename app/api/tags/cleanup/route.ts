import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  cleanupOrphanBeritaTags,
  getOrphanBeritaTagsCount,
} from "@/lib/models/tag.model";

/**
 * GET /api/tags/cleanup
 * Check how many orphan records exist
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orphanCount = await getOrphanBeritaTagsCount();

    return NextResponse.json({
      orphan_count: orphanCount,
      message:
        orphanCount > 0
          ? `Ditemukan ${orphanCount} orphan records yang perlu dibersihkan`
          : "Tidak ada orphan records",
    });
  } catch (error) {
    console.error("Check orphan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tags/cleanup
 * Clean up orphan records
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deletedCount = await cleanupOrphanBeritaTags();

    return NextResponse.json({
      deleted_count: deletedCount,
      message: `Berhasil membersihkan ${deletedCount} orphan records`,
    });
  } catch (error) {
    console.error("Cleanup orphan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
