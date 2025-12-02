import { NextRequest, NextResponse } from "next/server";
import { getPublishedGaleri } from "@/lib/models/galeri.model";

// GET - Get published galeri for frontend
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get("kategori") || undefined;
    const media_type = searchParams.get("media_type") as
      | "image"
      | "video"
      | undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;

    const galeri = await getPublishedGaleri({
      kategori,
      media_type,
      limit,
    });

    return NextResponse.json({ galeri });
  } catch (error) {
    console.error("Error fetching published galeri:", error);
    return NextResponse.json(
      { error: "Failed to fetch galeri" },
      { status: 500 }
    );
  }
}
