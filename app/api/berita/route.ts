// app/api/berita/route.ts

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

// GET /api/berita - Get all berita with filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const kategori_id = searchParams.get("kategori_id") || undefined;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;

    // Parse boolean filters
    const is_published = searchParams.get("is_published");
    const is_highlight = searchParams.get("is_highlight");

    const stats = searchParams.get("stats") === "true";

    // Return stats only
    if (stats) {
      const beritaStats = await BeritaRepository.getStats();
      return NextResponse.json(beritaStats);
    }

    // Get berita with filters
    const result = await BeritaRepository.findAll({
      page,
      limit,
      search,
      kategori_id,
      is_published: is_published ? is_published === "true" : undefined,
      is_highlight: is_highlight ? is_highlight === "true" : undefined,
      dateFrom,
      dateTo,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching berita:", error);
    return NextResponse.json(
      { error: "Failed to fetch berita" },
      { status: 500 }
    );
  }
}

// POST /api/berita - Create new berita
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN and EDITOR can create berita
    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validation schema
    const schema = z.object({
      judul: z.string().min(1, "Judul harus diisi").max(500),
      slug: z
        .string()
        .min(1, "Slug harus diisi")
        .max(500)
        .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan dash"),
      excerpt: z.string().min(1, "Excerpt harus diisi"),
      konten: z.string().min(1, "Konten harus diisi"),
      featured_image: z.string().optional(),
      galeri: z.array(z.string()).optional(),
      kategori_id: z.string().min(1, "Kategori harus dipilih"),
      tag_ids: z.array(z.string()).optional(),
      is_highlight: z.boolean().optional(),
      is_published: z.boolean().optional(),
      is_commented: z.boolean().optional(),
      published_at: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal publish tidak valid")
        .optional()
        .or(z.literal("")),
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

    // 🚦 VALIDASI TANGGAL PUBLISH (SERVER SIDE)
    let publishedAt: Date | null = null;

    if (data.published_at) {
      const dt = new Date(data.published_at);

      if (Number.isNaN(dt.getTime())) {
        return NextResponse.json(
          { error: "Tanggal publish tidak valid" },
          { status: 400 }
        );
      }

      // opsional: cegah tanggal '0000-00-00'
      if (dt.getFullYear() < 1970) {
        return NextResponse.json(
          { error: "Tanggal publish terlalu awal / tidak valid" },
          { status: 400 }
        );
      }

      publishedAt = dt;
    }

    // Kalau is_published = true tapi tanggal tidak diisi
    if (data.is_published && !publishedAt) {
      return NextResponse.json(
        {
          error: "Tanggal publish wajib diisi ketika status publish diaktifkan",
        },
        { status: 400 }
      );
    }

    // Create berita
    const id = await BeritaRepository.create(
      {
        ...data,
        author_id: session.user.id,
        published_at: publishedAt,
      },
      session.user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json(
      { message: "Berita berhasil dibuat", id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating berita:", error);
    return NextResponse.json(
      { error: "Failed to create berita" },
      { status: 500 }
    );
  }
}
