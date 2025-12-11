import { NextResponse } from "next/server";
import { query } from "@/lib/db-helpers";

export async function GET() {
  try {
    // Get last 6 months data for berita
    const beritaQuery = `
      SELECT 
        DATE_FORMAT(
          COALESCE(published_at, created_at), 
          '%b %Y'
        ) as month,
        DATE_FORMAT(
          COALESCE(published_at, created_at), 
          '%Y-%m'
        ) as month_key,
        COUNT(*) as count
      FROM berita
      WHERE 
        COALESCE(published_at, created_at) >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        AND is_published = 1
      GROUP BY month_key, month
      ORDER BY month_key ASC
    `;

    // Get last 6 months data for visitors
    const visitorQuery = `
      SELECT 
        DATE_FORMAT(visited_at, '%b %Y') as month,
        DATE_FORMAT(visited_at, '%Y-%m') as month_key,
        COUNT(*) as count
      FROM visitor_logs
      WHERE visited_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY month_key, month
      ORDER BY month_key ASC
    `;

    const [beritaResults, visitorResults] = await Promise.all([
      query<any>(beritaQuery),
      query<any>(visitorQuery),
    ]);

    // Generate last 6 months array
    const months: string[] = [];
    const monthKeys: string[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
      const monthName = date.toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      });
      monthKeys.push(monthKey);
      months.push(monthName);
    }

    // Map results to last 6 months
    const beritaData = monthKeys.map((key, index) => {
      const found = beritaResults.find((r: any) => r.month_key === key);
      return {
        month: months[index],
        count: found ? Number(found.count) : 0,
      };
    });

    const visitorData = monthKeys.map((key, index) => {
      const found = visitorResults.find((r: any) => r.month_key === key);
      return {
        month: months[index],
        count: found ? Number(found.count) : 0,
      };
    });

    console.log("Berita Data:", beritaData);
    console.log("Visitor Data:", visitorData);

    return NextResponse.json({
      beritaData,
      visitorData,
    });
  } catch (error) {
    console.error("Error fetching dashboard charts:", error);
    return NextResponse.json(
      {
        beritaData: [],
        visitorData: [],
      },
      { status: 500 }
    );
  }
}
