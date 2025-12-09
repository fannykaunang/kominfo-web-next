// app/backend/visitor/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Monitor,
  Smartphone,
  Tablet,
  Bot,
  TrendingUp,
  Calendar,
  Globe,
  Search,
  Download,
  Filter,
  ChevronDown,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types
interface VisitorStats {
  total: number;
  today: number;
  yesterday: number;
  this_week: number;
  this_month: number;
  unique_ips: number;
  by_device: {
    desktop: number;
    mobile: number;
    tablet: number;
    bot: number;
  };
  by_browser: Array<{ browser: string; count: number }>;
  by_os: Array<{ os: string; count: number }>;
  top_pages: Array<{ page_url: string; count: number }>;
  recent_visitors: any[];
}

interface VisitorLog {
  id: number;
  ip_address: string;
  browser: string | null;
  browser_version: string | null;
  os: string | null;
  device: string;
  page_url: string;
  referrer: string | null;
  visited_at: string;
}

export default function VisitorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 50;

  // Filters
  const [search, setSearch] = useState("");
  const [deviceFilter, setDeviceFilter] = useState<string>("");
  const [browserFilter, setBrowserFilter] = useState<string>("");
  const [osFilter, setOsFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Fetch stats
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch logs when filters change
  useEffect(() => {
    fetchLogs();
  }, [page, search, deviceFilter, browserFilter, osFilter, dateFrom, dateTo]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/visitor/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(deviceFilter && { device: deviceFilter }),
        ...(browserFilter && { browser: browserFilter }),
        ...(osFilter && { os: osFilter }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
      });

      console.log("Fetching logs with params:", params.toString());

      const res = await fetch(`/api/visitor?${params}`);

      console.log("API Response status:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("API Response data:", data);
        console.log("Logs count:", data.logs?.length);

        setLogs(data.logs || []);
        setTotal(data.total || 0);
      } else {
        console.error("API Error:", res.status, res.statusText);
        const errorText = await res.text();
        console.error("Error details:", errorText);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setDeviceFilter("");
    setBrowserFilter("");
    setOsFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      case "bot":
        return <Bot className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getDeviceColor = (device: string) => {
    switch (device) {
      case "mobile":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "tablet":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      case "bot":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
      default:
        return "bg-green-500/10 text-green-700 dark:text-green-400";
    }
  };

  if (!stats) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Visitor Analytics</h1>
        <p className="text-muted-foreground">
          Monitor dan analisa pengunjung website
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Total Visitors
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Today
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.today.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.yesterday > 0
                ? `${((stats.today / stats.yesterday - 1) * 100).toFixed(
                    1
                  )}% from yesterday`
                : "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              This Week
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.this_week.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              This Month
              <Calendar className="h-4 w-4 text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.this_month.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Unique IPs
              <Globe className="h-4 w-4 text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.unique_ips.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Avg/Day
              <Eye className="h-4 w-4 text-cyan-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.total / 30).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Device Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Monitor className="h-4 w-4 text-green-500" />
              Desktop
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.by_device.desktop.toLocaleString()}
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{
                  width: `${(stats.by_device.desktop / stats.total) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {((stats.by_device.desktop / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-blue-500" />
              Mobile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.by_device.mobile.toLocaleString()}
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{
                  width: `${(stats.by_device.mobile / stats.total) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {((stats.by_device.mobile / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tablet className="h-4 w-4 text-purple-500" />
              Tablet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.by_device.tablet.toLocaleString()}
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500"
                style={{
                  width: `${(stats.by_device.tablet / stats.total) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {((stats.by_device.tablet / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4 text-gray-500" />
              Bots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.by_device.bot.toLocaleString()}
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-500"
                style={{
                  width: `${(stats.by_device.bot / stats.total) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {((stats.by_device.bot / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Browser & OS Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Browsers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.by_browser.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">{item.browser}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">
                      {item.count.toLocaleString()}
                    </div>
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${(item.count / stats.total) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground w-12 text-right">
                      {((item.count / stats.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Operating Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.by_os.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">{item.os}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-muted-foreground">
                      {item.count.toLocaleString()}
                    </div>
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${(item.count / stats.total) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground w-12 text-right">
                      {((item.count / stats.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.top_pages.slice(0, 10).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-sm font-semibold text-muted-foreground w-6">
                    #{index + 1}
                  </div>
                  <div className="text-sm font-medium truncate">
                    {item.page_url}
                  </div>
                </div>
                <Badge variant="secondary">
                  {item.count.toLocaleString()} views
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visitor Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Visitor Logs</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search IP or URL..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full"
              />
            </div>

            <Select
              value={deviceFilter || "all"}
              onValueChange={(value) => {
                setDeviceFilter(value === "all" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Devices</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="bot">Bot</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={browserFilter || "all"}
              onValueChange={(value) => {
                setBrowserFilter(value === "all" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Browser" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Browsers</SelectItem>
                {stats.by_browser.map((b) => (
                  <SelectItem key={b.browser} value={b.browser}>
                    {b.browser}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="From"
            />

            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="To"
            />
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Browser</TableHead>
                  <TableHead>OS</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Referrer</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No visitor logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log, index) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium text-muted-foreground">
                        {(page - 1) * limit + index + 1}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {log.ip_address}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getDeviceColor(log.device)}
                        >
                          <span className="flex items-center gap-1.5">
                            {getDeviceIcon(log.device)}
                            {log.device}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {log.browser || "Unknown"}
                          {log.browser_version && (
                            <span className="text-muted-foreground ml-1">
                              v{log.browser_version}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{log.os || "Unknown"}</div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="text-sm max-w-xs truncate"
                          title={log.page_url}
                        >
                          {log.page_url}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className="text-sm text-muted-foreground max-w-xs truncate"
                          title={log.referrer || ""}
                        >
                          {log.referrer || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {new Date(log.visited_at).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, total)} of {total} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <Button
                        key={i}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-9"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
