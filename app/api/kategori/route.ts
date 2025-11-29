// app/api/kategori/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAllKategori,
  createKategori,
  isSlugExists,
  getKategoriStats,
} from "@/lib/models/kategori.model";
import { z } from "zod";
import { createLogWithData } from "@/lib/models/log.model";

// Helper kecil untuk ambil pegawai_id dari session
function getUserId(session: any): string {
  if (typeof session?.user?.id === "string" && session.user.id.length > 0) {
    return session.user.id;
  }

  // Kalau benar-benar nggak ada, ini kondisi yang "nggak boleh terjadi"
  // jadi kita lempar error biar ketangkap di catch dan return 500.
  throw new Error("User ID not found in session");
}

function getRequestMeta(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || undefined;
  const ua = request.headers.get("user-agent") || undefined;

  return {
    ip_address: ip, // string | undefined
    user_agent: ua, // string | undefined
    endpoint: request.nextUrl.pathname, // string
    method: request.method, // string
  };
}

// GET /api/kategori - Get all categories
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const stats = searchParams.get("stats") === "true";

    if (stats) {
      const kategoriStats = await getKategoriStats();
      return NextResponse.json(kategoriStats);
    }

    const kategori = await getAllKategori(search);
    return NextResponse.json(kategori);
  } catch (error) {
    console.error("Error fetching kategori:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/kategori - Create new category
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN and EDITOR can create categories
    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // Validation schema
    const schema = z.object({
      nama: z.string().min(1, "Nama kategori harus diisi").max(255),
      slug: z
        .string()
        .min(1, "Slug harus diisi")
        .max(255)
        .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan dash"),
      deskripsi: z.string().optional(),
      icon: z.string().max(100).optional(),
      color: z
        .string()
        .regex(/^#[0-9a-f]{6}$/i, "Color harus format hex")
        .optional(),
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if slug already exists
    const slugExists = await isSlugExists(data.slug);
    if (slugExists) {
      return NextResponse.json(
        { error: "Slug sudah digunakan" },
        { status: 409 }
      );
    }

    // Create category
    const id = await createKategori(data);

    // === LOGGING CREATE ===
    const user_id = getUserId(session);
    const meta = getRequestMeta(request);

    await createLogWithData({
      user_id,
      aksi: "Create",
      modul: "Kategori",
      detail_aksi: `Menambahkan kategori baru: ${data.nama} (id: ${id})`,
      data_sebelum: null,
      data_sesudah: { id, ...data },
      ...meta,
    });

    return NextResponse.json(
      { message: "Kategori berhasil dibuat", id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating kategori:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
