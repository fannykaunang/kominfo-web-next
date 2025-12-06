// app/backend/newsletter/_client.tsx

"use client";

import { useEffect, useState } from "react";
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
  Trash2,
} from "lucide-react";

export function NewsletterClient() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [stats, setStats] = useState<NewsletterStats>({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | null>(
    null
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsletterToDelete, setNewsletterToDelete] =
    useState<Newsletter | null>(null);

  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<Newsletter | null>(null);

  useEffect(() => {
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

  const handleCreateClick = () => {
    setEditingNewsletter(null);
    setFormDialogOpen(true);
  };

  const handleEditClick = (newsletter: Newsletter) => {
    setEditingNewsletter(newsletter);
    setFormDialogOpen(true);
  };

  const handleDeleteClick = (newsletter: Newsletter) => {
    setNewsletterToDelete(newsletter);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!newsletterToDelete) return;

    try {
      setActionLoading(newsletterToDelete.id);
      const res = await fetch(`/api/newsletter/${newsletterToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus newsletter");
      }

      toast.success("Newsletter berhasil dihapus");
      fetchNewsletters();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setActionLoading(null);
      setDeleteDialogOpen(false);
      setNewsletterToDelete(null);
    }
  };

  const handleToggleChange = (newsletter: Newsletter, nextState: boolean) => {
    const nextValue = nextState ? 1 : 0;
    if (nextValue === 1) {
      setToggleTarget({ ...newsletter, is_active: nextValue });
      setToggleDialogOpen(true);
    } else {
      updateStatus(newsletter.id, nextValue);
    }
  };

  const updateStatus = async (id: string, status: number) => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/newsletter/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal memperbarui status");
      }

      toast.success("Status newsletter diperbarui");
      fetchNewsletters();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setActionLoading(null);
      setToggleDialogOpen(false);
      setToggleTarget(null);
    }
  };

  const confirmToggle = () => {
    if (!toggleTarget) return;
    updateStatus(toggleTarget.id, toggleTarget.is_active);
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    setEditingNewsletter(null);
    fetchNewsletters();
  };

  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return "-";
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
      <div className="grid gap-4 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-lg border bg-white p-6 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Newsletter
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-200" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg border bg-white p-6 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Aktif
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.active}
              </p>
            </div>
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-200" />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg border bg-white p-6 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tidak Aktif
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.inactive}
              </p>
            </div>
            <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900">
              <Ban className="h-6 w-6 text-red-600 dark:text-red-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari email newsletter..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="1">Aktif</SelectItem>
              <SelectItem value="0">Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Newsletter
        </Button>
      </div>

      <div className="rounded-lg border bg-white dark:bg-gray-800">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>EMAIL</TableHead>
                <TableHead className="w-[140px] text-center">STATUS</TableHead>
                <TableHead className="w-[180px]">SUBSCRIBED</TableHead>
                <TableHead className="w-[180px]">UNSUBSCRIBED</TableHead>
                <TableHead className="w-[150px] text-center">AKSI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : newsletters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className="flex flex-col items-center justify-center py-12">
                      <Mail className="mb-4 h-12 w-12 text-gray-400" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        Tidak ada data
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Belum ada subscriber newsletter
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                newsletters.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {(currentPage - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {item.email}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={item.is_active === 1}
                          onCheckedChange={(checked) =>
                            handleToggleChange(item, checked)
                          }
                          disabled={actionLoading === item.id}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            item.is_active
                              ? "text-green-700 dark:text-green-300"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {item.is_active ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(item.subscribed_at)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(item.unsubscribed_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(item)}
                          className="h-8 w-8 p-0"
                          disabled={actionLoading === item.id}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(item)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                          disabled={actionLoading === item.id}
                        >
                          {actionLoading === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && newsletters.length > 0 && (
          <div className="flex items-center justify-between border-t px-6 py-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Menampilkan {(currentPage - 1) * limit + 1} -{" "}
              {Math.min(currentPage * limit, total)} dari {total} data
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

              {getPageNumbers().map((page, index) => (
                <Button
                  key={index}
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
              ))}

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

      <NewsletterFormDialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setEditingNewsletter(null);
        }}
        onSuccess={handleFormSuccess}
        newsletter={editingNewsletter}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Newsletter</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus {newsletterToDelete?.email}?
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

      <AlertDialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aktifkan Newsletter</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah ingin mengaktifkan newsletter ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setToggleDialogOpen(false);
                setToggleTarget(null);
              }}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle}>
              Ya, Aktifkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
