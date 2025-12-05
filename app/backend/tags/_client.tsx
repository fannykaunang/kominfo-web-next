"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Calendar,
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

export function TagsClient() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<TagStats>({
    total: 0,
    used: 0,
    unused: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [usedFilter, setUsedFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Dialogs
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTags();
  }, [currentPage, searchQuery, startDate, endDate, usedFilter]);

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
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (usedFilter !== "all") params.append("used", usedFilter);

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

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
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
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Tags */}
        <div className="relative overflow-hidden rounded-lg border bg-white p-6 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Tags
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
              <TagIcon className="h-6 w-6 text-blue-600 dark:text-blue-200" />
            </div>
          </div>
        </div>

        {/* Tags Digunakan */}
        <div className="relative overflow-hidden rounded-lg border bg-white p-6 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tags Digunakan
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.used}
              </p>
            </div>
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900">
              <Check className="h-6 w-6 text-green-600 dark:text-green-200" />
            </div>
          </div>
        </div>

        {/* Tags Tidak Digunakan */}
        <div className="relative overflow-hidden rounded-lg border bg-white p-6 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tags Tidak Digunakan
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.unused}
              </p>
            </div>
            <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900">
              <X className="h-6 w-6 text-red-600 dark:text-red-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari tags..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Start Date */}
            <div className="relative md:w-[180px]">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  handleFilterChange();
                }}
                className="pl-10"
              />
            </div>

            {/* End Date */}
            <div className="relative md:w-[180px]">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  handleFilterChange();
                }}
                className="pl-10"
              />
            </div>

            {/* Used Filter */}
            <Select
              value={usedFilter}
              onValueChange={(value) => {
                setUsedFilter(value);
                handleFilterChange();
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="used">Digunakan</SelectItem>
                <SelectItem value="unused">Tidak Digunakan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add Button */}
          <Button onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Tag
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white dark:bg-gray-800">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>NAMA TAG</TableHead>
                <TableHead>SLUG</TableHead>
                <TableHead className="w-[120px]">JUMLAH BERITA</TableHead>
                <TableHead className="w-[100px]">STATUS</TableHead>
                <TableHead className="w-[150px]">DIBUAT</TableHead>
                <TableHead className="w-[150px] text-center">AKSI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <div className="flex items-center justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
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
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(tag.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
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
      </div>

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
    </>
  );
}
