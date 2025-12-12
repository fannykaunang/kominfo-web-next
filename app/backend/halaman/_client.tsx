// app/backend/halaman/_client.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Filter,
} from "lucide-react";
import { HalamanFormDialog } from "./form-dialog";
import type { Halaman, Menu } from "@/lib/types";

interface Stats {
  total: number;
  published: number;
  draft: number;
  total_views: number;
}

interface HalamanClientProps {
  initialHalaman: Halaman[];
  initialMenu: Menu[];
  initialStats: Stats;
}

export function HalamanClient({
  initialHalaman,
  initialMenu,
  initialStats,
}: HalamanClientProps) {
  const router = useRouter();
  const [halaman, setHalaman] = useState<Halaman[]>(initialHalaman);
  const [filteredHalaman, setFilteredHalaman] =
    useState<Halaman[]>(initialHalaman);
  const [menu, setMenu] = useState<Menu[]>(initialMenu);
  const [stats, setStats] = useState<Stats>(initialStats);

  const [loading, setLoading] = useState(false);

  // Active filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMenu, setFilterMenu] = useState<string>("all");

  // Temporary filters for dialog
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [tempFilterStatus, setTempFilterStatus] = useState<string>("all");
  const [tempFilterMenu, setTempFilterMenu] = useState<string>("all");

  // Dialog states
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHalaman, setEditingHalaman] = useState<Halaman | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [halamanToDelete, setHalamanToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Flag untuk skip fetch pertama (data awal sudah dari server)
  const isFirstLoad = useRef(true);

  // Check if filters are active
  const hasActiveFilters =
    searchTerm || filterStatus !== "all" || filterMenu !== "all";

  // Fetch halaman (untuk filter, ubah status, delete, dll)
  const fetchHalaman = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterStatus !== "all") params.append("is_published", filterStatus);
      if (filterMenu !== "all") params.append("menu_id", filterMenu);

      const response = await fetch(`/api/halaman?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch halaman");

      const data = await response.json();
      setHalaman(data.halaman);
      setFilteredHalaman(data.halaman);
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching halaman:", error);
      toast.error("Gagal memuat data halaman");
    } finally {
      setLoading(false);
    }
  };

  // Panggil fetchHalaman hanya ketika filter berubah, *bukan* saat initial mount
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    fetchHalaman();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus, filterMenu]);

  // Handle filter dialog
  const handleOpenFilter = () => {
    setTempSearchTerm(searchTerm);
    setTempFilterStatus(filterStatus);
    setTempFilterMenu(filterMenu);
    setFilterDialogOpen(true);
  };

  const handleApplyFilters = () => {
    setSearchTerm(tempSearchTerm);
    setFilterStatus(tempFilterStatus);
    setFilterMenu(tempFilterMenu);
    setFilterDialogOpen(false);
  };

  const handleResetFilters = () => {
    setTempSearchTerm("");
    setTempFilterStatus("all");
    setTempFilterMenu("all");
  };

  // Handle create
  const handleCreate = () => {
    setEditingHalaman(null);
    setIsFormOpen(true);
  };

  // Handle edit
  const handleEdit = (item: Halaman) => {
    router.push(`/backend/halaman/${item.id}`);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!halamanToDelete) return;

    try {
      setActionLoading(halamanToDelete);
      const response = await fetch(`/api/halaman/${halamanToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete halaman");

      toast.success("Halaman berhasil dihapus");
      fetchHalaman();
    } catch (error) {
      console.error("Error deleting halaman:", error);
      toast.error("Gagal menghapus halaman");
    } finally {
      setActionLoading(null);
      setDeleteDialogOpen(false);
      setHalamanToDelete(null);
    }
  };

  // Handle toggle publish
  const handleTogglePublish = async (id: string, currentStatus: number) => {
    try {
      setActionLoading(id);
      const response = await fetch(`/api/halaman/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: currentStatus === 1 ? 0 : 1 }),
      });

      if (!response.ok) throw new Error("Failed to toggle publish");

      toast.success(
        `Halaman berhasil ${currentStatus === 1 ? "draft" : "publish"}`
      );

      fetchHalaman();
    } catch (error) {
      console.error("Error toggling publish:", error);
      toast.error("Gagal mengubah status");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle form success
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingHalaman(null);
    fetchHalaman();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Halaman
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
                  Published
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.published}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Draft
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.draft}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Views
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.total_views.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Daftar Halaman
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
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Halaman
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Loading / Empty / Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredHalaman.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum ada halaman</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Mulai dengan menambahkan halaman pertama Anda
              </p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Halaman
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Menu</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-center">Views</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHalaman.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="max-w-[300px]">
                          <div className="font-medium line-clamp-1">
                            {item.judul}
                          </div>
                          {item.excerpt && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {item.excerpt}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.menu_nama}</Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {item.slug}
                        </code>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {item.views.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={item.is_published === 1}
                            onCheckedChange={() =>
                              handleTogglePublish(item.id, item.is_published)
                            }
                            disabled={actionLoading === item.id}
                          />
                          <Badge
                            variant={
                              item.is_published === 1 ? "default" : "secondary"
                            }
                          >
                            {item.is_published === 1 ? "Published" : "Draft"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {item.author_name || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            disabled={actionLoading === item.id}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setHalamanToDelete(item.id);
                              setDeleteDialogOpen(true);
                            }}
                            disabled={actionLoading === item.id}
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
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
                  ))}
                </TableBody>
              </Table>
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
            setTempSearchTerm(searchTerm);
            setTempFilterStatus(filterStatus);
            setTempFilterMenu(filterMenu);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pencarian & Filter</DialogTitle>
            <DialogDescription>
              Sesuaikan pencarian, filter menu, dan status untuk daftar halaman.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="halaman-search">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="halaman-search"
                  type="text"
                  placeholder="Cari halaman..."
                  value={tempSearchTerm}
                  onChange={(e) => setTempSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Menu</Label>
                <Select
                  value={tempFilterMenu}
                  onValueChange={(value) => setTempFilterMenu(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih menu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Menu</SelectItem>
                    {menu.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={tempFilterStatus}
                  onValueChange={(value) => setTempFilterStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="1">Published</SelectItem>
                    <SelectItem value="0">Draft</SelectItem>
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
      <HalamanFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingHalaman={editingHalaman}
        menuOptions={menu}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Halaman?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Halaman akan dihapus secara
              permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
