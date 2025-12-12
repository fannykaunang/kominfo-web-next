// app/backend/komentar/_client.tsx

"use client";

import { useEffect, useState } from "react";
import {
  KomentarStats,
  KomentarWithBerita,
  PaginationResult,
} from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  CheckCircle2,
  Filter,
  Eye,
  MessageSquare,
  Search,
  Trash2,
} from "lucide-react";
import KomentarDetailModal from "./detail-modal";

interface KomentarClientProps {
  initialKomentar: PaginationResult<KomentarWithBerita>;
  initialStats: KomentarStats;
}

export default function KomentarClient({
  initialKomentar,
  initialStats,
}: KomentarClientProps) {
  const [komentarData, setKomentarData] =
    useState<PaginationResult<KomentarWithBerita>>(initialKomentar);
  const [stats, setStats] = useState<KomentarStats>(initialStats);

  // Active filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Temporary filters for dialog
  const [tempSearch, setTempSearch] = useState("");
  const [tempStatusFilter, setTempStatusFilter] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState(
    initialKomentar.pagination.page
  );
  const [isLoading, setIsLoading] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedKomentar, setSelectedKomentar] =
    useState<KomentarWithBerita | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Check if filters are active
  const hasActiveFilters = search || statusFilter !== "all";

  useEffect(() => {
    setKomentarData(initialKomentar);
  }, [initialKomentar]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/komentar?stats=true");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching komentar stats", error);
    }
  };

  const fetchKomentar = async (page = currentPage) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: komentarData.pagination.limit.toString(),
      });

      if (search) params.append("search", search);
      if (statusFilter !== "all")
        params.append("is_approved", statusFilter === "approved" ? "1" : "0");

      const res = await fetch(`/api/komentar?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setKomentarData(data);
        setCurrentPage(data.pagination.page);
      }
    } catch (error) {
      console.error("Error fetching komentar", error);
      toast.error("Gagal memuat komentar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFilter = () => {
    setTempSearch(search);
    setTempStatusFilter(statusFilter);
    setFilterDialogOpen(true);
  };

  const handleApplyFilters = () => {
    setSearch(tempSearch);
    setStatusFilter(tempStatusFilter);
    setCurrentPage(1);
    setFilterDialogOpen(false);
    // Trigger fetch after state updates
    setTimeout(() => fetchKomentar(1), 100);
  };

  const handleResetFilters = () => {
    setTempSearch("");
    setTempStatusFilter("all");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchKomentar(page);
  };

  const handleApproveClick = (komentar: KomentarWithBerita) => {
    setSelectedKomentar(komentar);
    setIsApproveOpen(true);
  };

  const handleDeleteClick = (komentar: KomentarWithBerita) => {
    setSelectedKomentar(komentar);
    setIsDeleteOpen(true);
  };

  const handleDetailClick = (komentar: KomentarWithBerita) => {
    setSelectedKomentar(komentar);
    setIsDetailOpen(true);
  };

  const approveKomentar = async () => {
    if (!selectedKomentar) return;

    try {
      const res = await fetch(`/api/komentar/${selectedKomentar.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_approved: true }),
      });

      if (res.ok) {
        toast.success("Komentar berhasil di-approve");
        fetchKomentar();
        fetchStats();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal meng-approve komentar");
      }
    } catch (error) {
      console.error("Error approving komentar", error);
      toast.error("Gagal meng-approve komentar");
    } finally {
      setIsApproveOpen(false);
      setSelectedKomentar(null);
    }
  };

  const deleteKomentar = async () => {
    if (!selectedKomentar) return;

    try {
      const res = await fetch(`/api/komentar/${selectedKomentar.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Komentar berhasil dihapus");
        fetchKomentar();
        fetchStats();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal menghapus komentar");
      }
    } catch (error) {
      console.error("Error deleting komentar", error);
      toast.error("Gagal menghapus komentar");
    } finally {
      setIsDeleteOpen(false);
      setSelectedKomentar(null);
    }
  };

  const totalPages = komentarData.pagination.totalPages;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Kelola Komentar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review, approve, atau hapus komentar pengunjung
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Komentar
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Di-approve
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.approved}
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
                  Belum di-approve
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.notApproved}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <Filter className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Data Komentar
            </CardTitle>
            <CardDescription>
              {komentarData.pagination.total} komentar ditemukan
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={hasActiveFilters ? "default" : "outline"}
              onClick={handleOpenFilter}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter & Pencarian
              {hasActiveFilters && <Badge variant="secondary">Aktif</Badge>}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NAMA</TableHead>
                  <TableHead>EMAIL</TableHead>
                  <TableHead>BERITA</TableHead>
                  <TableHead>KOMENTAR</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>TANGGAL</TableHead>
                  <TableHead className="text-center">AKSI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {komentarData.data.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-gray-500 py-12"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          Tidak ada komentar
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Komentar dari pengunjung akan muncul di sini
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {komentarData.data.map((komentar) => (
                  <TableRow key={komentar.id}>
                    <TableCell className="font-medium">
                      {komentar.nama}
                    </TableCell>
                    <TableCell>{komentar.email}</TableCell>
                    <TableCell className="max-w-[220px] truncate">
                      {komentar.berita_judul || "-"}
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate">
                      {komentar.konten}
                    </TableCell>
                    <TableCell>
                      {komentar.is_approved ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200">
                          Disetujui
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                          Menunggu
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(komentar.created_at).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDetailClick(komentar)}
                          className="h-8 w-8 p-0"
                          title="Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApproveClick(komentar)}
                          className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                          disabled={!!komentar.is_approved}
                          title="Approve"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(komentar)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-4 flex-wrap gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Halaman {komentarData.pagination.page} dari {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      size="sm"
                      variant={page === currentPage ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                      disabled={isLoading}
                      className="min-w-[40px]"
                    >
                      {page}
                    </Button>
                  )
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
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
            setTempSearch(search);
            setTempStatusFilter(statusFilter);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pencarian & Filter</DialogTitle>
            <DialogDescription>
              Gunakan pencarian dan status untuk memfilter komentar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="komentar-search">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="komentar-search"
                  type="text"
                  placeholder="Cari nama, email, isi komentar, atau judul berita"
                  value={tempSearch}
                  onChange={(e) => setTempSearch(e.target.value)}
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
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Belum di-approve</SelectItem>
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

      <KomentarDetailModal
        komentar={selectedKomentar}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      <AlertDialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Komentar</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah ingin meng-approve komentar ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={approveKomentar}>
              Ya, Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Komentar</AlertDialogTitle>
            <AlertDialogDescription>
              Komentar akan dihapus permanen. Lanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteKomentar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
