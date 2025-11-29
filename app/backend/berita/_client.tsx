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
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBerita, setSelectedBerita] = useState<Berita | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Refresh data from server
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
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
        fetch(`/api/berita?${params.toString()}`),
        fetch("/api/berita?stats=true"),
      ]);

      if (beritaRes.ok) {
        const data = await beritaRes.json();
        setBeritaData(data);
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
    refreshData();
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
    setTimeout(refreshData, 100);
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
    setCurrentPage(page);
    setTimeout(refreshData, 100);
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
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Berita
        </Button>
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                onValueChange={setFilterPublished}>
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
                onValueChange={setFilterHighlight}>
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
              <Select value={filterKategori} onValueChange={setFilterKategori}>
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

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button onClick={handleApplyFilters} disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              Terapkan Filter
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                disabled={isLoading}>
                <X className="h-4 w-4 mr-2" />
                Reset Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Daftar Berita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Highlight</TableHead>
                  <TableHead className="text-center">Views</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beritaData.data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500">
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
                            {berita.slug}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          style={{
                            backgroundColor: berita.kategori_color || "#3b82f6",
                            color: "white",
                          }}>
                          {berita.kategori_nama}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {berita.author_name}
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
                        <Badge variant="secondary">{berita.views}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDistanceToNow(new Date(berita.created_at), {
                          addSuffix: true,
                          locale: idLocale,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(berita)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(berita)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50">
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
          {beritaData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Halaman {beritaData.pagination.page} dari{" "}
                {beritaData.pagination.totalPages} (
                {beritaData.pagination.total} total berita)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={
                    currentPage === beritaData.pagination.totalPages ||
                    isLoading
                  }>
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
