// app/api/slider/[id]/route.ts

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

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slider = await SliderRepository.findById(params.id);
    if (!slider) {
      return NextResponse.json({ error: "Slider not found" }, { status: 404 });
    }

    return NextResponse.json({ slider });
  } catch (error) {
    console.error("Error fetching slider:", error);
    return NextResponse.json(
      { error: "Failed to fetch slider" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { judul, deskripsi, image, is_published } = body;

    const { ipAddress, userAgent } = getClientInfo(request);

    await SliderRepository.update(
      params.id,
      {
        judul,
        deskripsi,
        image,
        is_published:
          is_published !== undefined ? Number(is_published) : undefined,
      },
      session.user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json({ message: "Slider berhasil diperbarui" });
  } catch (error: any) {
    console.error("Error updating slider:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update slider" },
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

    const { ipAddress, userAgent } = getClientInfo(request);

    await SliderRepository.delete(
      params.id,
      session.user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json({ message: "Slider berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting slider:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete slider" },
      { status: 500 }
    );
  }
}
