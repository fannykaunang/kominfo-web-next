// app/api/log-aktivitas/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { query } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Get stats
    if (searchParams.get("stats") === "true") {
      const [totalResult] = await query<any>(
        `SELECT COUNT(*) as total FROM log_aktivitas`
      );

      const [filteredResult] = await query<any>(
        `SELECT COUNT(*) as total FROM log_aktivitas la
         JOIN users u ON la.user_id = u.id
         WHERE 1=1
         ${
           searchParams.get("search")
             ? "AND (u.name LIKE ? OR la.detail_aksi LIKE ?)"
             : ""
         }
      ${searchParams.get("modul") ? "AND la.modul = ?" : ""}
         ${searchParams.get("aksi") ? "AND la.aksi = ?" : ""}`,
        [
          ...(searchParams.get("search")
            ? [
                `%${searchParams.get("search")}%`,
                `%${searchParams.get("search")}%`,
              ]
            : []),
          ...(searchParams.get("modul") ? [searchParams.get("modul")] : []),
          ...(searchParams.get("aksi") ? [searchParams.get("aksi")] : []),
        ]
      );

      const [modulesResult] = await query<any>(
        `SELECT COUNT(DISTINCT modul) as count FROM log_aktivitas`
      );

      const [actionsResult] = await query<any>(
        `SELECT COUNT(DISTINCT aksi) as count FROM log_aktivitas`
      );

      return NextResponse.json({
        total: totalResult.total || 0,
        filtered: filteredResult.total || 0,
        uniqueModules: modulesResult.count || 0,
        uniqueActions: actionsResult.count || 0,
      });
    }

    // Get filter options
    if (searchParams.get("filters") === "true") {
      const modules = await query<any>(
        `SELECT DISTINCT modul FROM log_aktivitas WHERE modul IS NOT NULL ORDER BY modul`
      );

      const actions = await query<any>(
        `SELECT DISTINCT aksi FROM log_aktivitas WHERE aksi IS NOT NULL ORDER BY aksi`
      );

      return NextResponse.json({
        modules: modules.map((m: any) => m.modul),
        actions: actions.map((a: any) => a.aksi),
      });
    }

    // Get log list
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const modul = searchParams.get("modul") || "";
    const aksi = searchParams.get("aksi") || "";

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];

    if (search) {
      conditions.push("(u.name LIKE ? OR la.detail_aksi LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (modul) {
      conditions.push("la.modul = ?");
      params.push(modul);
    }

    if (aksi) {
      conditions.push("la.aksi = ?");
      params.push(aksi);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Get total count
    const [countResult] = await query<any>(
      `SELECT COUNT(*) as total FROM log_aktivitas la
      JOIN users u ON la.user_id = u.id
      ${whereClause}`,
      params
    );
    const total = countResult.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Get logs
    const logs = await query<any>(
      `SELECT 
        la.log_id,
        la.user_id,
        u.name AS user_name,
        la.aksi,
        la.modul,
        la.detail_aksi,
        la.endpoint,
        la.ip_address,
        la.user_agent,
        la.data_sebelum,
        la.data_sesudah,
        la.created_at
      FROM log_aktivitas la
      JOIN users u ON la.user_id = u.id
      ${whereClause}
     LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    // Parse JSON fields safely in case values are already objects or invalid JSON strings
    const parseJsonField = (value: any) => {
      if (!value) return null;
      if (typeof value !== "string") return value;

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    };

    const parsedLogs = logs.map((log: any) => ({
      ...log,
      data_sebelum: parseJsonField(log.data_sebelum),
      data_sesudah: parseJsonField(log.data_sesudah),
    }));

    return NextResponse.json({
      logs: parsedLogs,
      currentPage: page,
      totalPages,
      total,
      limit,
    });
  } catch (error) {
    console.error("Get log aktivitas error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
