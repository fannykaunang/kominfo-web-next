"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Activity,
  Filter,
  Monitor,
  AlertTriangle,
  Trash2,
  Eye,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LogDetailDialog } from "./detail-dialog";

interface LogAktivitas {
  log_id?: string;
  id: string;
  user_id: string;
  user_name: string;
  aksi: string;
  modul: string;
  detail_aksi: string;
  endpoint?: string;
  ip_address?: string;
  user_agent?: string;
  data_sebelum?: any;
  data_sesudah?: any;
  created_at: string;
}

interface Stats {
  total: number;
  filtered: number;
  uniqueModules: number;
  uniqueActions: number;
}

export function LogClient() {
  const [logs, setLogs] = useState<LogAktivitas[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    filtered: 0,
    uniqueModules: 0,
    uniqueActions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [modules, setModules] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);

  // Detail dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogAktivitas | null>(null);

  useEffect(() => {
    fetchStats();
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, searchQuery, moduleFilter, actionFilter]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/log-aktivitas?stats=true");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchFilters = async () => {
    try {
      const res = await fetch("/api/log-aktivitas?filters=true");
      if (res.ok) {
        const data = await res.json();
        setModules(data.modules || []);
        setActions(data.actions || []);
      }
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (searchQuery) params.append("search", searchQuery);
      if (moduleFilter !== "all") params.append("modul", moduleFilter);
      if (actionFilter !== "all") params.append("aksi", actionFilter);

      const res = await fetch(`/api/log-aktivitas?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Gagal memuat log aktivitas");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchStats(); // Update filtered count
  };

  const handleDeleteClick = (id: string) => {
    setLogToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!logToDelete) return;

    try {
      const res = await fetch(`/api/log-aktivitas/${logToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Log berhasil dihapus");
        fetchLogs();
        fetchStats();
      } else {
        toast.error("Gagal menghapus log");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeleteDialogOpen(false);
      setLogToDelete(null);
    }
  };

  const handleDeleteAllClick = () => {
    setDeleteAllDialogOpen(true);
  };

  const confirmDeleteAll = async () => {
    try {
      const res = await fetch("/api/log-aktivitas/delete-all", {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Semua log berhasil dihapus");
        fetchLogs();
        fetchStats();
      } else {
        toast.error("Gagal menghapus semua log");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeleteAllDialogOpen(false);
    }
  };

  const handleDetailClick = (log: LogAktivitas) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  const getActionBadgeColor = (aksi: string) => {
    const lowerAksi = aksi.toLowerCase();
    if (lowerAksi.includes("create") || lowerAksi.includes("login")) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    } else if (lowerAksi.includes("update") || lowerAksi.includes("edit")) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    } else if (
      lowerAksi.includes("delete") ||
      lowerAksi.includes("hapus") ||
      lowerAksi.includes("logout")
    ) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  const getMethodBadgeColor = (method?: string) => {
    if (!method)
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";

    switch (method.toUpperCase()) {
      case "POST":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "GET":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "PUT":
      case "PATCH":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "DELETE":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const extractMethod = (endpoint?: string) => {
    if (!endpoint) return null;
    const match = endpoint.match(/^(GET|POST|PUT|PATCH|DELETE)/i);
    return match ? match[1] : null;
  };

  const extractPath = (endpoint?: string) => {
    if (!endpoint) return "";
    const cleaned = endpoint.replace(/^(GET|POST|PUT|PATCH|DELETE)\s+/i, "");
    return cleaned;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Log */}
        <div className="relative overflow-hidden rounded-lg border bg-white p-6 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Log
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-200" />
            </div>
          </div>
        </div>

        {/* Hasil Filter */}
        <div className="relative overflow-hidden rounded-lg border bg-white p-6 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Hasil Filter
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.filtered}
              </p>
            </div>
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
              <Filter className="h-6 w-6 text-green-600 dark:text-green-200" />
            </div>
          </div>
        </div>

        {/* Modul Unik */}
        <div className="relative overflow-hidden rounded-lg border bg-white p-6 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Modul Unik
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.uniqueModules}
              </p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900">
              <Monitor className="h-6 w-6 text-purple-600 dark:text-purple-200" />
            </div>
          </div>
        </div>

        {/* Aksi Unik */}
        <div className="relative overflow-hidden rounded-lg border bg-white p-6 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Aksi Unik
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.uniqueActions}
              </p>
            </div>
            <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari log aktivitas..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Module Filter */}
          <Select
            value={moduleFilter}
            onValueChange={(value) => {
              setModuleFilter(value);
              handleFilterChange();
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Semua Modul" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Modul</SelectItem>
              {modules.map((module) => (
                <SelectItem key={module} value={module}>
                  {module}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Action Filter */}
          <Select
            value={actionFilter}
            onValueChange={(value) => {
              setActionFilter(value);
              handleFilterChange();
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Semua Aksi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Aksi</SelectItem>
              {actions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Delete All Button */}
        <Button
          variant="destructive"
          onClick={handleDeleteAllClick}
          className="whitespace-nowrap"
        >
          <Trash2 className="h-4 w-4" />
          Hapus Semua Log
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white dark:bg-gray-800">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">WAKTU</TableHead>
                <TableHead>PENGGUNA</TableHead>
                <TableHead className="w-[120px] text-center">AKSI</TableHead>
                <TableHead className="w-[100px]">MODUL</TableHead>
                <TableHead>DETAIL</TableHead>
                <TableHead className="w-[150px]">ENDPOINT</TableHead>
                <TableHead className="w-[140px]">IP ADDRESS</TableHead>
                <TableHead className="w-[120px] text-center">AKSI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    <div className="flex items-center justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    <div className="flex flex-col items-center justify-center py-12">
                      <Activity className="mb-4 h-12 w-12 text-gray-400" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        Tidak ada log aktivitas
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Log aktivitas akan muncul di sini
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, index) => {
                  const method = extractMethod(log.endpoint);
                  const path = extractPath(log.endpoint);
                  const rowKey =
                    log.log_id ??
                    log.id ??
                    `${log.user_id}-${log.created_at}-${index}`;

                  return (
                    <TableRow key={rowKey}>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                            <User className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {log.user_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getActionBadgeColor(
                            log.aksi
                          )}`}
                        >
                          {log.aksi}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.modul}
                      </TableCell>
                      <TableCell className="max-w-md truncate text-sm text-gray-600 dark:text-gray-400">
                        {log.detail_aksi}
                      </TableCell>
                      <TableCell>
                        {log.endpoint && (
                          <div className="flex flex-col gap-1">
                            {method && (
                              <span
                                className={`inline-flex w-fit rounded px-2 py-0.5 text-xs font-semibold ${getMethodBadgeColor(
                                  method
                                )}`}
                              >
                                {method}
                              </span>
                            )}
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {path}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-900 dark:bg-gray-700 dark:text-gray-200">
                          {log.ip_address || "-"}
                        </code>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDetailClick(log)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(log.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="flex items-center justify-between border-t px-6 py-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Menampilkan {(currentPage - 1) * limit + 1} -{" "}
              {Math.min(currentPage * limit, total)} dari {total} log
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {getPageNumbers().map((page, index) => {
                const key =
                  typeof page === "number" ? page : `ellipsis-${index}`;

                return (
                  <Button
                    key={key}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      typeof page === "number" && setCurrentPage(page)
                    }
                    disabled={typeof page === "string"}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                );
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Log Aktivitas</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus log ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Dialog */}
      <AlertDialog
        open={deleteAllDialogOpen}
        onOpenChange={setDeleteAllDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Semua Log Aktivitas</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus SEMUA log aktivitas? Tindakan
              ini tidak dapat dibatalkan dan akan menghapus {stats.total} log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAll}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail Dialog */}
      <LogDetailDialog
        log={selectedLog}
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedLog(null);
        }}
      />
    </>
  );
}
