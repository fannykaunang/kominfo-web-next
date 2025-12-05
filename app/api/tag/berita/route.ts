import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBeritaByTagId, getTagById } from "@/lib/models/tag.model";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, props: Props) {
  try {
    const params = await props.params;
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if tag exists
    const tag = await getTagById(params.id);
    if (!tag) {
      return NextResponse.json(
        { error: "Tag tidak ditemukan" },
        { status: 404 }
      );
    }

    // Get berita using this tag
    const berita = await getBeritaByTagId(params.id);

    return NextResponse.json({
      tag,
      berita,
      count: berita.length,
    });
  } catch (error) {
    console.error("Get berita by tag error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
