// app/api/kategori/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getKategoriById,
  updateKategori,
  deleteKategori,
  isSlugExists,
} from "@/lib/models/kategori.model";
import { z } from "zod";
import { createLogWithData } from "@/lib/models/log.model";

function getUserId(session: any): string {
  const id = (session as any)?.user?.id;
  if (typeof id === "string" && id.length > 0) return id;
  return "UNKNOWN";
}

// helper: meta request untuk log
function getRequestMeta(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || undefined;
  const ua = request.headers.get("user-agent") || undefined;

  return {
    ip_address: ip, // string | undefined (cocok dengan tipe optional string)
    user_agent: ua,
    endpoint: request.nextUrl.pathname,
    method: request.method,
  };
}

// GET /api/kategori/[id] - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const kategori = await getKategoriById(params.id);
    if (!kategori) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(kategori);
  } catch (error) {
    console.error("Error fetching kategori:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT /api/kategori/[id] - Update category
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN and EDITOR can update categories
    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if category exists (data sebelum)
    const before = await getKategoriById(id);
    if (!before) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if category exists
    const existing = await getKategoriById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validation schema
    const schema = z.object({
      nama: z.string().min(1).max(255).optional(),
      slug: z
        .string()
        .min(1)
        .max(255)
        .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan dash")
        .optional(),
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

    // Check if slug already exists (excluding current category)
    if (data.slug) {
      const slugExists = await isSlugExists(data.slug, id);
      if (slugExists) {
        return NextResponse.json(
          { error: "Slug sudah digunakan" },
          { status: 409 }
        );
      }
    }

    // Update category
    await updateKategori(id, data);

    // Ambil data setelah update
    const after = await getKategoriById(id);

    // LOG UPDATE
    const user_id = getUserId(session);
    const meta = getRequestMeta(request);

    await createLogWithData({
      user_id,
      aksi: "Update",
      modul: "Kategori",
      detail_aksi: `Mengubah kategori: ${before.nama} (id: ${id})`,
      data_sebelum: before,
      data_sesudah: after,
      ...meta,
    });

    return NextResponse.json({ message: "Kategori berhasil diupdate" });
  } catch (error) {
    console.error("Error updating kategori:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

// DELETE /api/kategori/[id] - Delete category
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ⬅️ penting
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only ADMIN can delete categories
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if category exists (data sebelum)
    const before = await getKategoriById(id);
    if (!before) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    // Delete category (will throw error if used by berita)
    await deleteKategori(id);

    // LOG DELETE
    const user_id = getUserId(session);
    const meta = getRequestMeta(request);

    await createLogWithData({
      user_id,
      aksi: "Delete",
      modul: "Kategori",
      detail_aksi: `Menghapus kategori: ${before.nama} (id: ${id})`,
      data_sebelum: before,
      data_sesudah: null,
      ...meta,
    });

    return NextResponse.json({ message: "Kategori berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting kategori:", error);

    if (error.message?.includes("sedang digunakan")) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
