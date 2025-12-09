// app/api/skpd/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAllSKPD,
  createSKPD,
  getSKPDCountByKategori,
} from "@/lib/models/skpd.model";
import { SKPDInput } from "@/lib/types";

// GET - List all SKPD or get stats
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stats = searchParams.get("stats");

    // Return stats if requested
    if (stats === "true") {
      const skpdList = await getAllSKPD();
      const countByKategori = await getSKPDCountByKategori();

      return NextResponse.json({
        total: skpdList.length,
        sekretariat:
          countByKategori.find((c) => c.kategori === "Sekretariat")?.jumlah ||
          0,
        dinas: countByKategori.find((c) => c.kategori === "Dinas")?.jumlah || 0,
        badan: countByKategori.find((c) => c.kategori === "Badan")?.jumlah || 0,
        inspektorat:
          countByKategori.find((c) => c.kategori === "Inspektorat")?.jumlah ||
          0,
        satuan:
          countByKategori.find((c) => c.kategori === "Satuan")?.jumlah || 0,
      });
    }

    // Return all SKPD
    const skpdList = await getAllSKPD();
    return NextResponse.json(skpdList);
  } catch (error) {
    console.error("Error fetching SKPD:", error);
    return NextResponse.json(
      { error: "Failed to fetch SKPD" },
      { status: 500 }
    );
  }
}

// POST - Create new SKPD
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: SKPDInput = await request.json();

    // Validate required fields
    if (!body.nama || !body.singkatan || !body.kategori) {
      return NextResponse.json(
        { error: "Nama, singkatan, dan kategori wajib diisi" },
        { status: 400 }
      );
    }

    // Get user info for logging
    const userId = session.user.id;
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      null;
    const userAgent = request.headers.get("user-agent") || null;

    const newId = await createSKPD(
      body,
      userId,
      ipAddress || undefined,
      userAgent || undefined
    );

    return NextResponse.json(
      { id: newId, message: "SKPD berhasil ditambahkan" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating SKPD:", error);
    return NextResponse.json(
      { error: "Gagal menambahkan SKPD" },
      { status: 500 }
    );
  }
}
