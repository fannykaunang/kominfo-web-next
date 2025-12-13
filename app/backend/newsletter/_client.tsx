// app/backend/newsletter/_client.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { Newsletter, NewsletterStats } from "@/lib/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
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
import { NewsletterFormDialog } from "./form-dialog";
import {
  Ban,
  CheckCircle2,
  Edit,
  Filter,
  Loader2,
  Mail,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Definisikan Interface Props
interface NewsletterClientProps {
  initialData: Newsletter[];
  initialStats: NewsletterStats;
  initialPagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
}

export function NewsletterClient({
  initialData,
  initialStats,
  initialPagination,
}: NewsletterClientProps) {
  // 1. Inisialisasi State dengan Data Server
  const [newsletters, setNewsletters] = useState<Newsletter[]>(initialData);
  const [stats, setStats] = useState<NewsletterStats>(initialStats);

  // Loading false karena data awal sudah ada
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Active filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Temporary filters for dialog
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [tempStatusFilter, setTempStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(initialPagination.currentPage);
  const [totalPages, setTotalPages] = useState(initialPagination.totalPages);
  const [total, setTotal] = useState(initialPagination.total);
  const limit = 20;

  // Ref untuk mencegah fetch ulang saat mounting pertama kali
  const isFirstLoad = useRef(true);

  // Dialog states
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | null>(
    null
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsletterToDelete, setNewsletterToDelete] =
    useState<Newsletter | null>(null);

  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<Newsletter | null>(null);

  // Check if filters are active
  const hasActiveFilters = searchQuery || statusFilter !== "all";

  // 2. Modified useEffect
  useEffect(() => {
    // Skip fetch pertama kali karena data sudah dari server
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    fetchNewsletters();
  }, [searchQuery, statusFilter, currentPage]);

  const fetchNewsletters = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("is_active", statusFilter);

      const res = await fetch(`/api/newsletter?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat newsletter");

      const data = await res.json();
      setNewsletters(data.newsletters || []);
      setStats(data.stats || { total: 0, active: 0, inactive: 0 });
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      toast.error("Gagal memuat data newsletter");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter dialog
  const handleOpenFilter = () => {
    setTempSearchQuery(searchQuery);
    setTempStatusFilter(statusFilter);
    setFilterDialogOpen(true);
  };

  const handleApplyFilters = () => {
    setSearchQuery(tempSearchQuery);
    setStatusFilter(tempStatusFilter);
    setCurrentPage(1);
    setFilterDialogOpen(false);
  };

  const handleResetFilters = () => {
    setTempSearchQuery("");
    setTempStatusFilter("all");
  };

  const handleDeleteClick = (item: Newsletter) => {
    setNewsletterToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!newsletterToDelete) return;

    try {
      setActionLoading(newsletterToDelete.id.toString());
      const res = await fetch(`/api/newsletter/${newsletterToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus newsletter");
      }

      toast.success("Newsletter berhasil dihapus");
      setDeleteDialogOpen(false);
      setNewsletterToDelete(null);
      fetchNewsletters(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus newsletter"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditClick = (item: Newsletter) => {
    setEditingNewsletter(item);
    setFormDialogOpen(true);
  };

  const handleToggleStatus = (item: Newsletter) => {
    setToggleTarget(item);
    setToggleDialogOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!toggleTarget) return;

    try {
      setActionLoading(toggleTarget.id.toString());
      const newStatus = toggleTarget.is_active ? 0 : 1;

      // Gunakan endpoint update yang sudah ada (sesuaikan jika endpoint spesifik toggle berbeda)
      const res = await fetch(`/api/newsletter/${toggleTarget.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengubah status");
      }

      toast.success(
        `Status berlangganan berhasil ${
          newStatus ? "diaktifkan" : "dinonaktifkan"
        }`
      );
      setToggleDialogOpen(false);
      setToggleTarget(null);
      fetchNewsletters(); // Refresh data
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengubah status newsletter");
    } finally {
      setActionLoading(null);
    }
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    setEditingNewsletter(null);
    fetchNewsletters();
  };

  // Pagination Helper
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end - start < maxVisiblePages - 1) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Kelola Newsletter
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Atur Newsletter penerima dan status langganan berita
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Subscriber
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Aktif
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.active}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tidak Aktif
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.inactive}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <Ban className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Daftar Newsletter
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
              onClick={() => {
                setEditingNewsletter(null);
                setFormDialogOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Email
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bergabung</TableHead>
                  <TableHead>Berhenti</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span>Memuat data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : newsletters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Mail className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          Tidak ada newsletter
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Belum ada email yang terdaftar
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  newsletters.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.is_active === 1}
                            onCheckedChange={() => handleToggleStatus(item)}
                            disabled={actionLoading === item.id.toString()}
                          />
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              item.is_active
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {item.is_active ? "Aktif" : "Tidak Aktif"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(item.subscribed_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        {item.unsubscribed_at
                          ? new Date(item.unsubscribed_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(item)}
                            className="h-8 w-8 p-0"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                            onClick={() => handleDeleteClick(item)}
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Menampilkan {(currentPage - 1) * limit + 1} sampai{" "}
                {Math.min(currentPage * limit, total)} dari {total} data
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      className="min-w-[40px]"
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={loading}
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || loading}
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
            setTempSearchQuery(searchQuery);
            setTempStatusFilter(statusFilter);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pencarian & Filter</DialogTitle>
            <DialogDescription>
              Sesuaikan pencarian dan status untuk daftar newsletter.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newsletter-search">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="newsletter-search"
                  type="text"
                  placeholder="Cari email..."
                  value={tempSearchQuery}
                  onChange={(e) => setTempSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={tempStatusFilter}
                onValueChange={(value) => setTempStatusFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Tidak Aktif</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Dialogs */}
      <NewsletterFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        initialData={editingNewsletter}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Newsletter?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus email{" "}
              <span className="font-bold text-foreground">
                {newsletterToDelete?.email}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleConfirmDelete}
              disabled={!!actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Status Confirmation Dialog */}
      <AlertDialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleTarget?.is_active
                ? "Nonaktifkan Langganan?"
                : "Aktifkan Langganan?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengubah status langganan untuk{" "}
              <span className="font-bold text-foreground">
                {toggleTarget?.email}
              </span>{" "}
              menjadi{" "}
              <span className="font-bold">
                {toggleTarget?.is_active ? "Tidak Aktif" : "Aktif"}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setToggleTarget(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggleStatus}
              disabled={!!actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Ya, Ubah"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
