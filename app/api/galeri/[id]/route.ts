import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getGaleriKategori } from "@/lib/models/galeri.model";

// GET - Get all unique categories
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const kategori = await getGaleriKategori();

    return NextResponse.json({ kategori });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
