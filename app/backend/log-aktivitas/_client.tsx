// app/backend/log-aktivitas/_client.tsx
"use client";

import { useState, useEffect, useRef } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { LogAktivitas } from "@/lib/types";

interface Stats {
  total: number;
  filtered: number;
  uniqueModules: number;
  uniqueActions: number;
}

interface LogClientProps {
  initialLogs: LogAktivitas[];
  initialStats: Stats;
  initialFilters: {
    modules: string[];
    actions: string[];
  };
  initialPagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  };
}

export function LogClient({
  initialLogs,
  initialStats,
  initialFilters,
  initialPagination,
}: LogClientProps) {
  // ====== STATE DATA DARI SERVER (INITIAL) ======
  const [logs, setLogs] = useState<LogAktivitas[]>(initialLogs);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [modules] = useState<string[]>(initialFilters.modules);
  const [actions] = useState<string[]>(initialFilters.actions);

  const [currentPage, setCurrentPage] = useState(initialPagination.currentPage);
  const [totalPages, setTotalPages] = useState(initialPagination.totalPages);
  const [total, setTotal] = useState(initialPagination.total);
  const limit = initialPagination.limit;

  // Loading state (false initially because we have server data)
  const [loading, setLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // ====== FILTERS ======
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  // Temporary filters for dialog
  const [tempSearch, setTempSearch] = useState("");
  const [tempModuleFilter, setTempModuleFilter] = useState("all");
  const [tempActionFilter, setTempActionFilter] = useState("all");

  // ====== DIALOGS ======
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogAktivitas | null>(null);

  // Flag untuk skip fetch pertama (karena data sudah dari server)
  const isFirstLoad = useRef(true);

  // ====== FETCH FUNCTIONS ======

  const fetchStats = async () => {
    try {
      // Kita kirim parameter filter juga agar stats filtered akurat
      const params = new URLSearchParams({
        stats: "true",
        search: searchQuery,
        modul: moduleFilter,
        aksi: actionFilter,
      });
      const res = await fetch(`/api/log-aktivitas?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
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

  // Hanya fetchLogs setelah interaksi (pagination / filter),
  // bukan saat mount pertama (data sudah dari server).
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    fetchLogs();
    fetchStats(); // Update stats filtered count when filter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, moduleFilter, actionFilter]);

  // ====== HANDLERS ======

  // Check if filters are active
  const hasActiveFilters =
    searchQuery || moduleFilter !== "all" || actionFilter !== "all";

  const handleOpenFilter = () => {
    setTempSearch(searchQuery);
    setTempModuleFilter(moduleFilter);
    setTempActionFilter(actionFilter);
    setFilterDialogOpen(true);
  };

  const handleApplyFilters = () => {
    setSearchQuery(tempSearch);
    setModuleFilter(tempModuleFilter);
    setActionFilter(tempActionFilter);
    setCurrentPage(1);
    setFilterDialogOpen(false);
  };

  const handleResetFilters = () => {
    setTempSearch("");
    setTempModuleFilter("all");
    setTempActionFilter("all");
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

  const handleDetailClick = async (logPartial: LogAktivitas) => {
    // 1. Buka dialog & set data sementara (agar user melihat respons cepat)
    setSelectedLog(logPartial);
    setDetailDialogOpen(true);
    setIsDetailLoading(true);

    try {
      // 2. Fetch data lengkap (termasuk data_sebelum/sesudah) dari API
      // Pastikan Anda punya endpoint API GET /api/log-aktivitas/[id]
      const res = await fetch(`/api/log-aktivitas/${logPartial.log_id}`);

      if (res.ok) {
        const fullData = await res.json();
        // 3. Update selectedLog dengan data lengkap
        setSelectedLog(fullData);
      } else {
        toast.error("Gagal memuat detail lengkap JSON");
      }
    } catch (error) {
      console.error("Error fetching detail:", error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // ====== HELPERS (Badge Colors & Formatters) ======

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
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Log Aktivitas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor semua aktivitas pengguna di sistem
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Log */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Log
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hasil Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Hasil Filter
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.filtered}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <Filter className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modul Unik */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Modul Unik
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.uniqueModules}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Monitor className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aksi Unik */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Aksi Unik
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.uniqueActions}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Daftar Log Aktivitas
          </CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              variant={hasActiveFilters ? "default" : "outline"}
              onClick={handleOpenFilter}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter & Pencarian
              {hasActiveFilters && <Badge variant="secondary">Aktif</Badge>}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllClick}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Hapus Semua Log
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">WAKTU</TableHead>
                    <TableHead>PENGGUNA</TableHead>
                    <TableHead className="w-[120px] text-center">
                      AKSI
                    </TableHead>
                    <TableHead className="w-[100px]">MODUL</TableHead>
                    <TableHead>DETAIL</TableHead>
                    <TableHead className="w-[150px]">ENDPOINT</TableHead>
                    <TableHead className="w-[140px]">IP ADDRESS</TableHead>
                    <TableHead className="w-[120px] text-center">
                      AKSI
                    </TableHead>
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
                            <div className="flex items-center justify-end gap-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDetailClick(log)}
                                className="h-8 w-8 p-0"
                                title="Detail"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(log.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                title="Hapus"
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
        </CardContent>
      </Card>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onOpenChange={(open) => {
          setFilterDialogOpen(open);
          if (open) {
            setTempSearch(searchQuery);
            setTempModuleFilter(moduleFilter);
            setTempActionFilter(actionFilter);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pencarian & Filter</DialogTitle>
            <DialogDescription>
              Sesuaikan pencarian, filter modul, dan filter aksi untuk daftar
              log aktivitas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="log-search">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="log-search"
                  type="text"
                  placeholder="Cari log aktivitas..."
                  value={tempSearch}
                  onChange={(e) => setTempSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Modul</Label>
                <Select
                  value={tempModuleFilter}
                  onValueChange={(value) => setTempModuleFilter(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih modul" />
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
              </div>

              <div className="space-y-2">
                <Label>Aksi</Label>
                <Select
                  value={tempActionFilter}
                  onValueChange={(value) => setTempActionFilter(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih aksi" />
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
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button variant="ghost" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button onClick={handleApplyFilters} className="w-full sm:w-auto">
              Terapkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialogs */}
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
    </div>
  );
}
