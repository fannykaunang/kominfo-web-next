// app/api/komentar/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { KomentarRepository } from "@/lib/models/komentar.model";

function parseBoolean(param: string | null): boolean | undefined {
  if (param === null) return undefined;
  if (param === "1" || param === "true") return true;
  if (param === "0" || param === "false") return false;
  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statsOnly = searchParams.get("stats") === "true";

    if (statsOnly) {
      const stats = await KomentarRepository.getStats();
      return NextResponse.json(stats);
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const is_approved = parseBoolean(searchParams.get("is_approved"));

    const komentar = await KomentarRepository.findAll({
      page,
      limit,
      search,
      is_approved,
    });

    return NextResponse.json(komentar);
  } catch (error) {
    console.error("Error fetching komentar:", error);
    return NextResponse.json(
      { error: "Failed to fetch komentar" },
      { status: 500 }
    );
  }
}
