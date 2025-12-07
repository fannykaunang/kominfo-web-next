// app/backend/tags/_client.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Filter,
  Tag as TagIcon,
  Check,
  X,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
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
import { TagFormDialog } from "./form-dialog";
import { TagDetailDialog } from "./detail-dialog";
import { Tag, TagStats } from "@/lib/types";

interface TagsClientProps {
  initialTags: Tag[];
  initialStats: TagStats;
  initialPagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  };
}

export function TagsClient({
  initialTags,
  initialStats,
  initialPagination,
}: TagsClientProps) {
  // ====== STATE DATA DARI SERVER (INITIAL) ======
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [stats, setStats] = useState<TagStats>(initialStats);

  const [currentPage, setCurrentPage] = useState(initialPagination.currentPage);
  const [totalPages, setTotalPages] = useState(initialPagination.totalPages);
  const [total, setTotal] = useState(initialPagination.total);
  const limit = initialPagination.limit;

  // Loading untuk fetch selanjutnya (bukan initial SSR)
  const [loading, setLoading] = useState(false);

  // ====== FILTERS ======
  const [searchQuery, setSearchQuery] = useState("");
  const [usedFilter, setUsedFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"default" | "most" | "least">(
    "default"
  );
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [tempSearch, setTempSearch] = useState("");
  const [tempUsedFilter, setTempUsedFilter] = useState("all");
  const [tempSortOrder, setTempSortOrder] = useState<
    "default" | "most" | "least"
  >("default");

  // ====== DIALOGS ======
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  // Flag untuk skip fetch pertama (karena data sudah dari server)
  const isFirstLoad = useRef(true);

  // ====== FETCH FUNCTIONS ======

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/tags?stats=true");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchTags = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (searchQuery) params.append("search", searchQuery);
      if (usedFilter !== "all") params.append("used", usedFilter);
      if (sortOrder !== "default") params.append("sort", sortOrder);

      const res = await fetch(`/api/tags?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTags(data.tags);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast.error("Gagal memuat tags");
    } finally {
      setLoading(false);
    }
  };

  // Hanya fetchTags setelah interaksi (pagination / filter),
  // bukan saat mount pertama (data sudah dari server).
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, usedFilter, sortOrder]);

  // ====== HANDLERS ======

  const handleOpenFilter = () => {
    setTempSearch(searchQuery);
    setTempUsedFilter(usedFilter);
    setTempSortOrder(sortOrder);
    setFilterDialogOpen(true);
  };

  const handleApplyFilters = () => {
    setSearchQuery(tempSearch);
    setUsedFilter(tempUsedFilter);
    setSortOrder(tempSortOrder);
    setCurrentPage(1);
    setFilterDialogOpen(false);
  };

  const handleResetFilters = () => {
    setTempSearch("");
    setTempUsedFilter("all");
    setTempSortOrder("default");
  };

  const handleCreateClick = () => {
    setEditingTag(null);
    setFormDialogOpen(true);
  };

  const handleEditClick = (tag: Tag) => {
    setEditingTag(tag);
    setFormDialogOpen(true);
  };

  const handleDetailClick = (tag: Tag) => {
    setSelectedTag(tag);
    setDetailDialogOpen(true);
  };

  const handleDeleteClick = (tag: Tag) => {
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!tagToDelete) return;

    try {
      const res = await fetch(`/api/tags/${tagToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Tag berhasil dihapus");
        fetchTags();
        fetchStats();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal menghapus tag");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeleteDialogOpen(false);
      setTagToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    setEditingTag(null);
    fetchTags();
    fetchStats();
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

  // ====== RENDER ======

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Kelola Tag
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Atur tag untuk berita dan konten
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
                  Total Tags
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <TagIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tags Digunakan
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.used}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tags Tidak Digunakan
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.unused}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <X className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <TagIcon className="h-5 w-5" />
            Daftar Tag
          </CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              onClick={handleOpenFilter}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter & Pencarian
            </Button>
            <Button onClick={handleCreateClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Tag
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>NAMA TAG</TableHead>
                    <TableHead>SLUG</TableHead>
                    <TableHead className="w-[150px] text-center">
                      JUMLAH BERITA
                    </TableHead>
                    <TableHead className="w-[120px]">STATUS</TableHead>
                    <TableHead className="w-[150px]">DIBUAT</TableHead>
                    <TableHead className="w-[150px] text-center">
                      AKSI
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        <div className="flex items-center justify-center py-8">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : tags.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        <div className="flex flex-col items-center justify-center py-12">
                          <TagIcon className="mb-4 h-12 w-12 text-gray-400" />
                          <p className="text-lg font-medium text-gray-900 dark:text-white">
                            Tidak ada tags
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Belum ada tags yang dibuat
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    tags.map((tag, index) => (
                      <TableRow key={tag.id}>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {(currentPage - 1) * limit + index + 1}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-white">
                          {tag.nama}
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-900 dark:bg-gray-700 dark:text-gray-200">
                            {tag.slug}
                          </code>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {tag.berita_count || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          {tag.is_used ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-200">
                              <Check className="h-3 w-3" />
                              Digunakan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                              <X className="h-3 w-3" />
                              Tidak
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                          {formatDate(tag.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDetailClick(tag)}
                              className="h-8 w-8 p-0"
                              title="Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(tag)}
                              className="h-8 w-8 p-0"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(tag)}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                              title="Delete"
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
          </div>

          {/* Pagination */}
          {!loading && tags.length > 0 && (
            <div className="flex items-center justify-between border-t px-6 py-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Menampilkan {(currentPage - 1) * limit + 1} -{" "}
                {Math.min(currentPage * limit, total)} dari {total} tags
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
        </CardContent>
      </Card>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onOpenChange={(open) => {
          setFilterDialogOpen(open);
          if (open) {
            setTempSearch(searchQuery);
            setTempUsedFilter(usedFilter);
            setTempSortOrder(sortOrder);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pencarian & Filter</DialogTitle>
            <DialogDescription>
              Sesuaikan pencarian, status penggunaan, dan urutan jumlah berita
              untuk daftar tag.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-search">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="tag-search"
                  type="text"
                  placeholder="Cari tags..."
                  value={tempSearch}
                  onChange={(e) => setTempSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status Penggunaan</Label>
                <Select
                  value={tempUsedFilter}
                  onValueChange={(value) => setTempUsedFilter(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="used">Digunakan</SelectItem>
                    <SelectItem value="unused">Tidak Digunakan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Urutkan Jumlah Berita</Label>
                <Select
                  value={tempSortOrder}
                  onValueChange={(value) =>
                    setTempSortOrder(value as "default" | "most" | "least")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih urutan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Terbaru</SelectItem>
                    <SelectItem value="most">
                      Jumlah berita terbanyak
                    </SelectItem>
                    <SelectItem value="least">
                      Jumlah berita paling sedikit
                    </SelectItem>
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

      {/* Form Dialog */}
      <TagFormDialog
        open={formDialogOpen}
        onClose={() => {
          setFormDialogOpen(false);
          setEditingTag(null);
        }}
        onSuccess={handleFormSuccess}
        tag={editingTag}
      />

      {/* Detail Dialog */}
      <TagDetailDialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedTag(null);
        }}
        tag={selectedTag}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus tag "{tagToDelete?.nama}"?
              {tagToDelete?.berita_count && tagToDelete.berita_count > 0 && (
                <span className="mt-2 block text-red-600 dark:text-red-400">
                  Tag ini digunakan di {tagToDelete.berita_count} berita dan
                  tidak dapat dihapus.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={
                tagToDelete?.berita_count ? tagToDelete.berita_count > 0 : false
              }
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
