// app/api/visitor/stats/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getVisitorStats,
  getDailyVisitorChart,
  getHourlyVisitorChart,
} from "@/lib/models/visitor.model";

// GET - Get visitor statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getVisitorStats();
    const dailyChart = await getDailyVisitorChart();
    const hourlyChart = await getHourlyVisitorChart();

    return NextResponse.json({ stats, dailyChart, hourlyChart });
  } catch (error) {
    console.error("Error fetching visitor stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch visitor stats" },
      { status: 500 }
    );
  }
}
