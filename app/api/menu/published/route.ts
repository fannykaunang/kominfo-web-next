// app/api/menu/published/route.ts

import { NextResponse } from "next/server";
import { getPublishedMenuWithHalaman } from "@/lib/models/menu.model";

export async function GET() {
  try {
    const menu = await getPublishedMenuWithHalaman();
    return NextResponse.json(menu);
  } catch (error) {
    console.error("Error fetching published menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}
