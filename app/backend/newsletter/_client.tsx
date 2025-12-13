// app/backend/newsletter/_client.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { Newsletter, NewsletterStats } from "@/lib/types";
import { toast } from "sonner";
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
  Loader2,
  Mail,
  Plus,
  Search,
  TagIcon,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(initialPagination.currentPage);
  const [totalPages, setTotalPages] = useState(initialPagination.totalPages);
  const [total, setTotal] = useState(initialPagination.total);
  const limit = 20;

  // Ref untuk mencegah fetch ulang saat mounting pertama kali
  const isFirstLoad = useRef(true);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | null>(
    null
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsletterToDelete, setNewsletterToDelete] =
    useState<Newsletter | null>(null);

  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<Newsletter | null>(null);

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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
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
            Atur Newsletter penerima dan status langganan berita.
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
                <Mail className="h-9 w-9 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Semua email terdaftar
            </p>
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
              <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <CheckCircle2 className="h-9 w-9 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Subscriber aktif menerima email
            </p>
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
              <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Ban className="h-9 w-9 text-red-600 dark:text-red-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Subscriber berhenti berlangganan
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-4 md:max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari email..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => {
            setEditingNewsletter(null);
            setFormDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Email
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead>Berhenti</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
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
                <TableCell colSpan={5} className="h-24 text-center">
                  Tidak ada data newsletter ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              newsletters.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.email}</TableCell>
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
                    {new Date(item.subscribed_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
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
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteClick(item)}
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
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
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
              Sebelumnya
            </Button>
            <div className="flex items-center gap-1">
              {getPageNumbers().map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  className="w-8"
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

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
