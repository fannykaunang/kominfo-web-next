"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MoreVertical,
  LogOut,
  Ban,
  Activity,
  Users,
  Monitor,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface SessionWithUser {
  id: string;
  user_id: string;
  token_hash: string;
  ip_address: string;
  user_agent: string | null;
  device_info: string | null;
  location: string | null;
  login_at: Date;
  last_activity_at: Date;
  expires_at: Date;
  is_active: number;
  user_name: string;
  user_email: string;
  user_role: string;
  user_avatar: string | null;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  expired: number;
  suspicious: number;
}

interface KickDialogData {
  sessionId: string;
  userName: string;
  action: "kick" | "ban";
}

export default function SessionsClient() {
  const [sessions, setSessions] = useState<SessionWithUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [kickDialog, setKickDialog] = useState<KickDialogData | null>(null);
  const [reasonDialog, setReasonDialog] = useState(false);
  const [reason, setReason] = useState("");
  const limit = 20;

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/sessions?stats=true");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  // Fetch sessions
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") {
        params.append(
          "is_active",
          statusFilter === "active" ? "true" : "false"
        );
      }

      const res = await fetch(`/api/sessions?${params}`);
      if (!res.ok) throw new Error("Failed to fetch sessions");

      const data = await res.json();
      setSessions(data.data);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Gagal memuat data sesi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [currentPage, searchQuery, statusFilter]);

  // Handle kick
  const handleKickClick = (session: SessionWithUser) => {
    setKickDialog({
      sessionId: session.id,
      userName: session.user_name,
      action: "kick",
    });
  };

  const confirmKick = async () => {
    if (!kickDialog) return;

    try {
      const res = await fetch(`/api/sessions/${kickDialog.sessionId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "Kicked by admin" }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to kick session");
      }

      toast.success("Sesi berhasil di-kick");
      setKickDialog(null);
      setReason("");
      fetchSessions();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || "Gagal kick sesi");
    }
  };

  // Handle ban
  const handleBanClick = (session: SessionWithUser) => {
    setKickDialog({
      sessionId: session.id,
      userName: session.user_name,
      action: "ban",
    });
    setReasonDialog(true);
  };

  const confirmBan = async () => {
    if (!kickDialog) return;

    try {
      const res = await fetch(`/api/sessions/${kickDialog.sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ban",
          reason: reason || "Banned by admin",
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to ban user");
      }

      toast.success("User berhasil dibanned dan semua sesi di-kick");
      setKickDialog(null);
      setReasonDialog(false);
      setReason("");
      fetchSessions();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || "Gagal ban user");
    }
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage <= 3) {
        pages.push(2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  // Get device badge color
  const getDeviceBadge = (deviceInfo: string | null) => {
    if (!deviceInfo) return null;

    if (deviceInfo.includes("Mobile")) {
      return (
        <Badge variant="outline" className="text-blue-600">
          📱 {deviceInfo}
        </Badge>
      );
    }
    if (deviceInfo.includes("Desktop")) {
      return (
        <Badge variant="outline" className="text-green-600">
          🖥️ {deviceInfo}
        </Badge>
      );
    }
    return <Badge variant="outline">{deviceInfo}</Badge>;
  };

  // Check if session is suspicious
  const isSuspicious = (session: SessionWithUser) => {
    // Could add more logic here
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Sesi
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
              <Monitor className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Aktif
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.active}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tidak Aktif
                </p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {stats.inactive}
                </p>
              </div>
              <Users className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Expired
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.expired}
                </p>
              </div>
              <Shield className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mencurigakan
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.suspicious}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari user..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Memuat data...
            </p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center">
            <Monitor className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
              Tidak ada sesi
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Belum ada sesi aktif yang tercatat
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {session.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {session.user_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {session.user_email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getDeviceBadge(session.device_info)}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {session.ip_address}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDistanceToNow(new Date(session.login_at), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDistanceToNow(
                          new Date(session.last_activity_at),
                          {
                            addSuffix: true,
                            locale: id,
                          }
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      {session.is_active === 1 ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <Activity className="h-3 w-3 mr-1" />
                          Aktif
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                          Nonaktif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {session.is_active === 1 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleKickClick(session)}
                            >
                              <LogOut className="h-4 w-4 mr-2" />
                              Kick Sesi
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleBanClick(session)}
                              className="text-red-600"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Kick & Ban User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Menampilkan {(currentPage - 1) * limit + 1}-
                {Math.min(currentPage * limit, total)} dari {total} sesi
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {getPageNumbers().map((page, index) =>
                  typeof page === "number" ? (
                    <Button
                      key={index}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  ) : (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      disabled
                      className="w-10"
                    >
                      ...
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Kick Confirmation Dialog */}
      <AlertDialog
        open={
          kickDialog !== null && kickDialog.action === "kick" && !reasonDialog
        }
        onOpenChange={() => setKickDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kick Sesi?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin kick sesi dari user{" "}
              <strong>{kickDialog?.userName}</strong>? User akan otomatis logout
              dan harus login ulang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmKick}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Kick
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban Dialog with Reason */}
      <Dialog open={reasonDialog} onOpenChange={setReasonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kick & Ban User</DialogTitle>
            <DialogDescription>
              Tindakan ini akan:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Kick semua sesi aktif user</li>
                <li>Nonaktifkan akun user</li>
                <li>User tidak bisa login sampai akun diaktifkan kembali</li>
              </ul>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reason">Alasan (Opsional)</Label>
              <Textarea
                id="reason"
                placeholder="Masukkan alasan kick & ban..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReasonDialog(false)}>
              Batal
            </Button>
            <Button
              onClick={confirmBan}
              className="bg-red-600 hover:bg-red-700"
            >
              Kick & Ban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
