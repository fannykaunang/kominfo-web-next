// app/api/slider/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SliderRepository } from "@/lib/models/slider.model";

function getClientInfo(request: NextRequest) {
  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return { ipAddress, userAgent };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const is_published = searchParams.get("is_published");

    const options: any = { search };
    if (is_published && is_published !== "all") {
      options.is_published = parseInt(is_published);
    }

    const sliders = await SliderRepository.findAll(options);
    const stats = await SliderRepository.getStats();

    return NextResponse.json({ sliders, stats });
  } catch (error) {
    console.error("Error fetching sliders:", error);
    return NextResponse.json(
      { error: "Failed to fetch sliders" },
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

    const body = await request.json();
    const { judul, deskripsi, image, is_published } = body;

    if (!judul || !image) {
      return NextResponse.json(
        { error: "Judul dan gambar wajib diisi" },
        { status: 400 }
      );
    }

    const { ipAddress, userAgent } = getClientInfo(request);

    const id = await SliderRepository.create(
      {
        judul,
        deskripsi: deskripsi || null,
        image,
        is_published: is_published !== undefined ? Number(is_published) : 0,
      },
      session.user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json({ id, message: "Slider berhasil dibuat" });
  } catch (error: any) {
    console.error("Error creating slider:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create slider" },
      { status: 500 }
    );
  }
}
