import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { StatistikRepository } from "@/lib/models/statistik.model";

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
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const statistik = await StatistikRepository.findById(params.id);
    if (!statistik) {
      return NextResponse.json(
        { error: "Statistik tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(statistik);
  } catch (error) {
    console.error("Error fetching statistik:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistik" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    await StatistikRepository.updateStatistik(
      params.id,
      {
        judul: body.judul,
        nilai: body.nilai,
        satuan: body.satuan,
        icon: body.icon,
        kategori: body.kategori,
        urutan: body.urutan,
      },
      session.user.id,
      getRequestMeta(request)
    );

    return NextResponse.json({ message: "Statistik berhasil diperbarui" });
  } catch (error: any) {
    console.error("Error updating statistik:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update statistik" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await StatistikRepository.deleteStatistik(
      params.id,
      session.user.id,
      getRequestMeta(request)
    );

    return NextResponse.json({ message: "Statistik berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting statistik:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete statistik" },
      { status: 500 }
    );
  }
}
