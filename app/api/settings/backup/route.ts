import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAppSettings,
  runAutoBackupCycle,
} from "@/lib/models/settings.model";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const force = Boolean(body?.force);

    const result = await runAutoBackupCycle({
      userId: session.user.id,
      force,
      endpoint: request.nextUrl.pathname,
      method: request.method,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error running backup", error);
    return NextResponse.json(
      { error: "Gagal menjalankan backup" },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getAppSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error loading settings for backup", error);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}
