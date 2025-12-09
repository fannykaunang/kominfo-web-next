import { query, execute } from "@/lib/db-helpers";
import {
  VisitorLog,
  VisitorLogCreateInput,
  VisitorStats,
  VisitorFilterOptions,
} from "@/lib/types";

// ============================================
// VISITOR LOG REPOSITORY
// ============================================

/**
 * Create visitor log entry
 */
export async function createVisitorLog(
  data: VisitorLogCreateInput
): Promise<void> {
  await execute(
    `
    INSERT INTO visitor_logs (
      ip_address, user_agent, browser, browser_version,
      os, device, page_url, referrer, session_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.ip_address,
      data.user_agent || null,
      data.browser || null,
      data.browser_version || null,
      data.os || null,
      data.device || "desktop",
      data.page_url,
      data.referrer || null,
      data.session_id || null,
    ]
  );
}

/**
 * Get all visitor logs with filters and pagination
 */
export async function getAllVisitorLogs(
  options: VisitorFilterOptions = {}
): Promise<{ logs: VisitorLog[]; total: number }> {
  const {
    search,
    device,
    browser,
    os,
    date_from,
    date_to,
    page = 1,
    limit = 50,
  } = options;

  let whereClause = "WHERE 1=1";
  const params: any[] = [];

  if (search) {
    whereClause += ` AND (ip_address LIKE ? OR page_url LIKE ?)`;
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern);
  }

  if (device) {
    whereClause += ` AND device = ?`;
    params.push(device);
  }

  if (browser) {
    whereClause += ` AND browser = ?`;
    params.push(browser);
  }

  if (os) {
    whereClause += ` AND os = ?`;
    params.push(os);
  }

  if (date_from) {
    whereClause += ` AND DATE(visited_at) >= ?`;
    params.push(date_from);
  }

  if (date_to) {
    whereClause += ` AND DATE(visited_at) <= ?`;
    params.push(date_to);
  }

  // Get total count
  const countSql = `SELECT COUNT(*) as total FROM visitor_logs ${whereClause}`;
  const countResult = await query<any>(countSql, params);
  const total = Number(countResult[0]?.total || 0);

  // Get paginated data
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 50;
  const offset = (page - 1) * safeLimit;
  const dataSql = `
    SELECT * FROM visitor_logs
    ${whereClause}
    ORDER BY visited_at DESC
    LIMIT ${safeLimit} OFFSET ${offset}
  `;

  // Use only filter params since LIMIT/OFFSET are injected as numbers
  const dataParams = [...params];

  const logs = await query<VisitorLog>(dataSql, dataParams);

  return { logs, total };
}

/**
 * Get visitor statistics
 */
export async function getVisitorStats(): Promise<VisitorStats> {
  // Total visitors
  const totalResult = await query<any>(
    `SELECT COUNT(*) as total FROM visitor_logs`
  );
  const total = Number(totalResult[0]?.total || 0);

  // Today visitors
  const todayResult = await query<any>(
    `SELECT COUNT(*) as today FROM visitor_logs WHERE DATE(visited_at) = CURDATE()`
  );
  const today = Number(todayResult[0]?.today || 0);

  // Yesterday visitors
  const yesterdayResult = await query<any>(
    `SELECT COUNT(*) as yesterday FROM visitor_logs WHERE DATE(visited_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`
  );
  const yesterday = Number(yesterdayResult[0]?.yesterday || 0);

  // This week visitors
  const weekResult = await query<any>(
    `SELECT COUNT(*) as this_week FROM visitor_logs WHERE YEARWEEK(visited_at, 1) = YEARWEEK(CURDATE(), 1)`
  );
  const this_week = Number(weekResult[0]?.this_week || 0);

  // This month visitors
  const monthResult = await query<any>(
    `SELECT COUNT(*) as this_month FROM visitor_logs WHERE YEAR(visited_at) = YEAR(CURDATE()) AND MONTH(visited_at) = MONTH(CURDATE())`
  );
  const this_month = Number(monthResult[0]?.this_month || 0);

  // Unique IPs
  const uniqueResult = await query<any>(
    `SELECT COUNT(DISTINCT ip_address) as unique_ips FROM visitor_logs`
  );
  const unique_ips = Number(uniqueResult[0]?.unique_ips || 0);

  // By device
  const deviceResult = await query<any>(
    `SELECT device, COUNT(*) as count FROM visitor_logs GROUP BY device`
  );
  const by_device = {
    desktop: 0,
    mobile: 0,
    tablet: 0,
    bot: 0,
  };
  deviceResult.forEach((row: any) => {
    if (row.device in by_device) {
      by_device[row.device as keyof typeof by_device] = Number(row.count);
    }
  });

  // By browser (top 10)
  const browserResult = await query<any>(
    `SELECT browser, COUNT(*) as count FROM visitor_logs WHERE browser IS NOT NULL GROUP BY browser ORDER BY count DESC LIMIT 10`
  );
  const by_browser = browserResult.map((row: any) => ({
    browser: row.browser,
    count: Number(row.count),
  }));

  // By OS (top 10)
  const osResult = await query<any>(
    `SELECT os, COUNT(*) as count FROM visitor_logs WHERE os IS NOT NULL GROUP BY os ORDER BY count DESC LIMIT 10`
  );
  const by_os = osResult.map((row: any) => ({
    os: row.os,
    count: Number(row.count),
  }));

  // Top pages (top 10)
  const pageResult = await query<any>(
    `SELECT page_url, COUNT(*) as count FROM visitor_logs GROUP BY page_url ORDER BY count DESC LIMIT 10`
  );
  const top_pages = pageResult.map((row: any) => ({
    page_url: row.page_url,
    count: Number(row.count),
  }));

  // Recent visitors (last 10)
  const recentResult = await query<VisitorLog>(
    `SELECT * FROM visitor_logs ORDER BY visited_at DESC LIMIT 10`
  );

  return {
    total,
    today,
    yesterday,
    this_week,
    this_month,
    unique_ips,
    by_device,
    by_browser,
    by_os,
    top_pages,
    recent_visitors: recentResult,
  };
}

/**
 * Delete old visitor logs (cleanup)
 * @param days Number of days to keep (delete older than this)
 */
export async function deleteOldVisitorLogs(days: number = 90): Promise<number> {
  const result = await execute(
    `DELETE FROM visitor_logs WHERE visited_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
    [days]
  );
  return result.affectedRows || 0;
}

/**
 * Get daily visitor chart data (last 30 days)
 */
export async function getDailyVisitorChart(): Promise<
  Array<{ date: string; count: number }>
> {
  const result = await query<any>(
    `
    SELECT 
      DATE(visited_at) as date,
      COUNT(*) as count
    FROM visitor_logs
    WHERE visited_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY DATE(visited_at)
    ORDER BY date ASC
    `
  );

  return result.map((row: any) => ({
    date: row.date,
    count: Number(row.count),
  }));
}

/**
 * Get hourly visitor chart data (today)
 */
export async function getHourlyVisitorChart(): Promise<
  Array<{ hour: number; count: number }>
> {
  const result = await query<any>(
    `
    SELECT 
      HOUR(visited_at) as hour,
      COUNT(*) as count
    FROM visitor_logs
    WHERE DATE(visited_at) = CURDATE()
    GROUP BY HOUR(visited_at)
    ORDER BY hour ASC
    `
  );

  return result.map((row: any) => ({
    hour: Number(row.hour),
    count: Number(row.count),
  }));
}
