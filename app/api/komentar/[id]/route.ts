// app/api/komentar/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { KomentarRepository } from "@/lib/models/komentar.model";
import { z } from "zod";

function getRequestMeta(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || undefined;
  const ua = request.headers.get("user-agent") || undefined;

  return {
    ip_address: ip,
    user_agent: ua,
    endpoint: request.nextUrl.pathname,
    method: request.method,
  };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const komentar = await KomentarRepository.findById(id);
    if (!komentar) {
      return NextResponse.json(
        { error: "Komentar tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(komentar);
  } catch (error) {
    console.error("Error fetching komentar:", error);
    return NextResponse.json(
      { error: "Failed to fetch komentar" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const schema = z.object({ is_approved: z.boolean() });
    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    if (!validation.data.is_approved) {
      return NextResponse.json(
        { error: "Hanya aksi approve yang diizinkan" },
        { status: 400 }
      );
    }

    await KomentarRepository.approveKomentar(
      id,
      session.user.id,
      getRequestMeta(request)
    );

    return NextResponse.json({ message: "Komentar berhasil di-approve" });
  } catch (error) {
    console.error("Error updating komentar:", error);
    return NextResponse.json(
      { error: "Failed to update komentar" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await KomentarRepository.deleteKomentar(
      id,
      session.user.id,
      getRequestMeta(request)
    );

    return NextResponse.json({ message: "Komentar berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting komentar:", error);
    return NextResponse.json(
      { error: "Failed to delete komentar" },
      { status: 500 }
    );
  }
}
