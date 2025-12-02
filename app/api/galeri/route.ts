import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAllGaleri,
  createGaleri,
  getGaleriStats,
} from "@/lib/models/galeri.model";

// GET - List all galeri
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const kategori = searchParams.get("kategori") || undefined;
    const media_type = searchParams.get("media_type") as
      | "image"
      | "video"
      | undefined;
    const is_published = searchParams.get("is_published") || undefined;

    const galeri = await getAllGaleri({
      search,
      kategori,
      media_type,
      is_published,
    });

    const stats = await getGaleriStats();

    return NextResponse.json({
      galeri,
      stats,
    });
  } catch (error) {
    console.error("Error fetching galeri:", error);
    return NextResponse.json(
      { error: "Failed to fetch galeri" },
      { status: 500 }
    );
  }
}

// POST - Create new galeri
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validation
    if (!body.judul || !body.media_type || !body.media_url || !body.kategori) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate media_type
    if (!["image", "video"].includes(body.media_type)) {
      return NextResponse.json(
        { error: 'Invalid media_type. Must be "image" or "video"' },
        { status: 400 }
      );
    }

    // For videos, validate YouTube URL
    if (body.media_type === "video") {
      const youtubeRegex =
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      if (!youtubeRegex.test(body.media_url)) {
        return NextResponse.json(
          { error: "Invalid YouTube URL" },
          { status: 400 }
        );
      }
    }

    const galeriId = await createGaleri(
      {
        judul: body.judul,
        deskripsi: body.deskripsi,
        media_type: body.media_type,
        media_url: body.media_url,
        thumbnail: body.thumbnail,
        kategori: body.kategori,
        is_published: body.is_published,
        urutan: body.urutan,
      },
      session.user.id
    );

    return NextResponse.json({
      success: true,
      id: galeriId,
    });
  } catch (error) {
    console.error("Error creating galeri:", error);
    return NextResponse.json(
      { error: "Failed to create galeri" },
      { status: 500 }
    );
  }
}
