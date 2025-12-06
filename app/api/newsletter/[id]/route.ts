import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  deleteNewsletter,
  getNewsletterById,
  updateNewsletter,
} from "@/lib/models/newsletter.model";

function getClientInfo(request: NextRequest) {
  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return { ipAddress, userAgent };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const newsletter = await getNewsletterById(id);

    if (!newsletter) {
      return NextResponse.json(
        { error: "Newsletter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(newsletter);
  } catch (error) {
    console.error("Error fetching newsletter:", error);
    return NextResponse.json(
      { error: "Failed to fetch newsletter" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { email, is_active, unsubscribed_at } = body;

    if (
      email === undefined &&
      is_active === undefined &&
      unsubscribed_at === undefined
    ) {
      return NextResponse.json(
        { error: "Tidak ada data yang diubah" },
        { status: 400 }
      );
    }

    const { ipAddress, userAgent } = getClientInfo(request);

    await updateNewsletter(
      id,
      { email, is_active, unsubscribed_at },
      session.user.id,
      ipAddress,
      userAgent
    );

    return NextResponse.json({ message: "Newsletter berhasil diperbarui" });
  } catch (error: any) {
    console.error("Error updating newsletter:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update newsletter" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { ipAddress, userAgent } = getClientInfo(request);

    await deleteNewsletter(id, session.user.id, ipAddress, userAgent);

    return NextResponse.json({ message: "Newsletter berhasil dihapus" });
  } catch (error: any) {
    console.error("Error deleting newsletter:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete newsletter" },
      { status: 500 }
    );
  }
}
