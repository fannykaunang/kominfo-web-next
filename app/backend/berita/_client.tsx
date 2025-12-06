// app/backend/berita/_client.tsx

"use client";

import { useState } from "react";
import { Berita, Kategori, PaginationResult } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Calendar,
  Filter,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DeleteBeritaDialog from "./delete-dialog";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BeritaClientProps {
  initialBerita: PaginationResult<Berita>;
  initialStats: {
    total: number;
    published: number;
    unpublished: number;
  };
  kategoriList: Kategori[];
}

export default function BeritaClient({
  initialBerita,
  initialStats,
  kategoriList,
}: BeritaClientProps) {
  const [beritaData, setBeritaData] = useState(initialBerita);
  const [stats, setStats] = useState(initialStats);
  const [search, setSearch] = useState("");
  const [filterPublished, setFilterPublished] = useState<string>("all");
  const [filterHighlight, setFilterHighlight] = useState<string>("all");
  const [filterKategori, setFilterKategori] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(
    initialBerita.pagination.page || 1
  );
  const [itemsPerPage, setItemsPerPage] = useState(
    initialBerita.pagination.limit || 10
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBerita, setSelectedBerita] = useState<Berita | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();

  // Refresh data from server
  const refreshData = async (
    page: number = currentPage,
    limit: number = itemsPerPage
  ) => {
    const targetPage = Math.max(1, page);
    const targetLimit = Math.max(1, limit);

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: targetPage.toString(),
        limit: targetLimit.toString(),
      });

      if (search) params.append("search", search);
      if (filterPublished !== "all")
        params.append("is_published", filterPublished);
      if (filterHighlight !== "all")
        params.append("is_highlight", filterHighlight);
      if (filterKategori !== "all")
        params.append("kategori_id", filterKategori);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const [beritaRes, statsRes] = await Promise.all([
        fetch(`/api/berita?${params.toString()}`, { cache: "no-store" }),
        fetch("/api/berita?stats=true", { cache: "no-store" }),
      ]);

      if (beritaRes.ok) {
        const data = await beritaRes.json();
        setBeritaData(data);
        setCurrentPage(data.pagination.page);
        setItemsPerPage(data.pagination.limit);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const handleApplyFilters = () => {
    setCurrentPage(1);
    refreshData(1, itemsPerPage);
    setIsFilterOpen(false);
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearch("");
    setFilterPublished("all");
    setFilterHighlight("all");
    setFilterKategori("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
    refreshData(1, itemsPerPage);
    setIsFilterOpen(false);
  };

  const handleEdit = (berita: Berita) => {
    router.push(`/backend/berita/edit/${berita.id}`);
  };

  const handleDelete = (berita: Berita) => {
    setSelectedBerita(berita);
    setIsDeleteOpen(true);
  };

  const handleAddNew = () => {
    router.push("/backend/berita/tambah");
  };

  const handleSuccess = () => {
    refreshData();
    setIsDeleteOpen(false);
    setSelectedBerita(null);
  };

  const handlePageChange = (page: number) => {
    const totalPages = beritaData.pagination.totalPages || 1;
    const nextPage = Math.min(Math.max(page, 1), totalPages);

    if (nextPage === currentPage) return;

    setCurrentPage(nextPage);
    refreshData(nextPage, itemsPerPage);
  };

  const handleLimitChange = (limit: number) => {
    const newLimit = Math.max(1, limit);

    setItemsPerPage(newLimit);
    setCurrentPage(1);
    refreshData(1, newLimit);
  };

  // Check if any filter is active
  const hasActiveFilters =
    search ||
    filterPublished !== "all" ||
    filterHighlight !== "all" ||
    filterKategori !== "all" ||
    dateFrom ||
    dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Kelola Berita
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage berita dan artikel untuk website
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Berita
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Berita Published
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.published}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Berita Unpublished
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.unpublished}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <EyeOff className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Daftar Berita
          </CardTitle>

          <div className="flex items-center gap-2">
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button
                  variant={hasActiveFilters ? "default" : "outline"}
                  className="gap-2"
                  disabled={isLoading}
                >
                  <Filter className="h-4 w-4" />
                  Filter & Pencarian
                  {hasActiveFilters && <Badge variant="secondary">Aktif</Badge>}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filter & Pencarian
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Search */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Pencarian</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="search"
                          placeholder="Cari judul berita..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Status Publish</Label>
                      <Select
                        value={filterPublished}
                        onValueChange={setFilterPublished}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Status</SelectItem>
                          <SelectItem value="true">Published</SelectItem>
                          <SelectItem value="false">Unpublished</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Highlight</Label>
                      <Select
                        value={filterHighlight}
                        onValueChange={setFilterHighlight}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Semua" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua</SelectItem>
                          <SelectItem value="true">Ya</SelectItem>
                          <SelectItem value="false">Tidak</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Kategori</Label>
                      <Select
                        value={filterKategori}
                        onValueChange={setFilterKategori}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Semua Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Kategori</SelectItem>
                          {kategoriList.map((k) => (
                            <SelectItem key={k.id} value={k.id}>
                              {k.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tanggal Dari</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Tanggal Sampai</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row sm:justify-between sm:space-x-2">
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      disabled={isLoading}
                      className="w-full sm:w-auto"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reset Filter
                    </Button>
                  )}
                  <Button
                    onClick={handleApplyFilters}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Terapkan Filter
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {/* Tambah Berita dipindah ke sini */}
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Berita
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Highlight</TableHead>
                  <TableHead className="text-center">Komentar</TableHead>
                  <TableHead className="text-center">Views</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beritaData.data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-gray-500"
                    >
                      Belum ada berita
                    </TableCell>
                  </TableRow>
                ) : (
                  beritaData.data.map((berita) => (
                    <TableRow key={berita.id}>
                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium truncate">
                            {berita.judul}
                          </div>
                          <code className="text-xs text-gray-500">
                            {berita.excerpt}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell className="align-middle">
                        {(() => {
                          const namaKategori = berita.kategori_nama ?? ""; // aman dari undefined
                          const tampil =
                            namaKategori.length > 11
                              ? namaKategori.slice(0, 11) // contoh: "Sekilas Mer"
                              : namaKategori;

                          // Kalau kamu mau tetap pakai Badge hanya saat ada kategori:
                          if (!namaKategori) {
                            return (
                              <span className="text-xs text-gray-400 italic">
                                Tanpa Kategori
                              </span>
                            );
                          }

                          return (
                            <Badge
                              className="whitespace-nowrap"
                              style={{
                                backgroundColor:
                                  berita.kategori_color || "#3b82f6",
                                color: "white",
                              }}
                              title={namaKategori}
                            >
                              {tampil}
                            </Badge>
                          );
                        })()}
                      </TableCell>

                      <TableCell className="text-xs">
                        {berita.author_name}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDistanceToNow(new Date(berita.created_at), {
                          addSuffix: true,
                          locale: idLocale,
                        })}
                      </TableCell>
                      <TableCell className="text-center">
                        {berita.is_published ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <Eye className="h-3 w-3 mr-1" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {berita.is_highlight ? (
                          <Star className="h-4 w-4 text-yellow-500 mx-auto fill-yellow-500" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {berita.is_commented ? (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            Nonaktif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{berita.views}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(berita)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(berita)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
          {beritaData.pagination.totalPages > 0 && (
            <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Menampilkan{" "}
                {(beritaData.pagination.page - 1) *
                  beritaData.pagination.limit +
                  1}{" "}
                -{" "}
                {Math.min(
                  beritaData.pagination.page * beritaData.pagination.limit,
                  beritaData.pagination.total
                )}{" "}
                dari {beritaData.pagination.total} berita
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Tampilkan</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => handleLimitChange(Number(value))}
                >
                  <SelectTrigger className="w-[90px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 25, 50, 100].map((limit) => (
                      <SelectItem key={limit} value={limit.toString()}>
                        {limit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>per halaman</span>
              </div>
              <div className="flex gap-1">
                {/* Previous Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  Previous
                </Button>

                {/* Page Numbers */}
                {(() => {
                  const totalPages = beritaData.pagination.totalPages;
                  const current = currentPage;
                  const pages: (number | string)[] = [];

                  if (totalPages <= 7) {
                    // Show all pages if total <= 7
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Always show first page
                    pages.push(1);

                    if (current <= 3) {
                      // Near start: 1 [2] 3 4 ... Last
                      pages.push(2, 3, 4, "...", totalPages);
                    } else if (current >= totalPages - 2) {
                      // Near end: 1 ... N-3 N-2 [N-1] N
                      pages.push(
                        "...",
                        totalPages - 3,
                        totalPages - 2,
                        totalPages - 1,
                        totalPages
                      );
                    } else {
                      // Middle: 1 ... [N-1] N N+1 ... Last
                      pages.push(
                        "...",
                        current - 1,
                        current,
                        current + 1,
                        "...",
                        totalPages
                      );
                    }
                  }

                  return pages.map((page, idx) => {
                    if (page === "...") {
                      return (
                        <Button
                          key={`ellipsis-${idx}`}
                          variant="ghost"
                          size="sm"
                          disabled
                          className="w-10"
                        >
                          ...
                        </Button>
                      );
                    }

                    const pageNum = page as number;
                    return (
                      <Button
                        key={pageNum}
                        variant={current === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isLoading}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  });
                })()}

                {/* Next Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={
                    currentPage === beritaData.pagination.totalPages ||
                    isLoading
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <DeleteBeritaDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        berita={selectedBerita}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
