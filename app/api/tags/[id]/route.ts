import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getTagById,
  updateTag,
  deleteTag,
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

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tag = await getTagById(params.id);

    if (!tag) {
      return NextResponse.json(
        { error: "Tag tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Get tag error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, props: Props) {
  try {
    const params = await props.params;
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

    // Check if tag exists
    const existingTag = await getTagById(params.id);
    if (!existingTag) {
      return NextResponse.json(
        { error: "Tag tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if name exists (exclude current tag)
    const nameExists = await tagNameExists(nama.trim(), params.id);
    if (nameExists) {
      return NextResponse.json(
        { error: "Tag dengan nama ini sudah ada" },
        { status: 400 }
      );
    }

    // Update tag
    const tag = await updateTag(params.id, {
      nama: nama.trim(),
      userId: session.user.id,
      userName: session.user.name || "Unknown",
      ipAddress: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("Update tag error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can delete
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      await deleteTag(params.id, {
        userId: session.user.id,
        userName: session.user.name || "Unknown",
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
      });

      return NextResponse.json({ message: "Tag berhasil dihapus" });
    } catch (error: any) {
      if (error.message.includes("digunakan")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Delete tag error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
