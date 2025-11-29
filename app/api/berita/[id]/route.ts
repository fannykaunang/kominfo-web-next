import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { BeritaRepository } from "@/lib/models/berita.model";
import { z } from "zod";

// Helper to get client info
function getClientInfo(request: NextRequest) {
  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return { ipAddress, userAgent };
}

// GET /api/berita/[id] - Get single berita
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const berita = await BeritaRepository.findById(params.id);

    if (!berita) {
      return NextResponse.json(
        { error: "Berita tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(berita);
  } catch (error) {
    console.error("Error fetching berita:", error);
    return NextResponse.json(
      { error: "Failed to fetch berita" },
      { status: 500 }
    );
  }
}

// PUT /api/berita/[id] - Update berita
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN and EDITOR can update berita
    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if berita exists
    const existing = await BeritaRepository.findById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: "Berita tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validation schema
    const schema = z.object({
      judul: z.string().min(1).max(500).optional(),
      slug: z
        .string()
        .min(1)
        .max(500)
        .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan dash")
        .optional(),
      excerpt: z.string().min(1).optional(),
      konten: z.string().min(1).optional(),
      featured_image: z.string().optional(),
      galeri: z.array(z.string()).optional(),
      kategori_id: z.string().optional(),
      is_highlight: z.boolean().optional(),
      is_published: z.boolean().optional(),
      published_at: z.string().nullable().optional(),
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;
    const { ipAddress, userAgent } = getClientInfo(request);

    // Update berita
    const success = await BeritaRepository.update(
      params.id,
      {
        ...data,
        published_at: data.published_at ? new Date(data.published_at) : null,
      },
      session.user.id,
      ipAddress,
      userAgent
    );

    if (!success) {
      return NextResponse.json(
        { error: "Tidak ada perubahan" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Berita berhasil diupdate" });
  } catch (error) {
    console.error("Error updating berita:", error);
    return NextResponse.json(
      { error: "Failed to update berita" },
      { status: 500 }
    );
  }
}

// DELETE /api/berita/[id] - Delete berita
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can delete berita
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if berita exists
    const existing = await BeritaRepository.findById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: "Berita tidak ditemukan" },
        { status: 404 }
      );
    }

    const { ipAddress, userAgent } = getClientInfo(request);

    // Delete berita
    const success = await BeritaRepository.delete(
      params.id,
      session.user.id,
      ipAddress,
      userAgent
    );

    if (!success) {
      return NextResponse.json(
        { error: "Gagal menghapus berita" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Berita berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting berita:", error);
    return NextResponse.json(
      { error: "Failed to delete berita" },
      { status: 500 }
    );
  }
}
