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

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const search = new URL(request.url).searchParams.get("search") || undefined;
    const statistik = await StatistikRepository.findAll({ search });
    const highlights = statistik.slice(0, 4);

    return NextResponse.json({ statistik, highlights });
  } catch (error) {
    console.error("Error fetching statistik:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistik" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "EDITOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    if (!body.judul || !body.nilai || !body.kategori) {
      return NextResponse.json(
        { error: "Judul, nilai, dan kategori wajib diisi" },
        { status: 400 }
      );
    }

    const id = await StatistikRepository.createStatistik(
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

    return NextResponse.json({ id, message: "Statistik berhasil dibuat" });
  } catch (error: any) {
    console.error("Error creating statistik:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create statistik" },
      { status: 500 }
    );
  }
}
