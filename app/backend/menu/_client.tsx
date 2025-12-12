// app/backend/menu/_client.tsx

"use client";

import { useState, useEffect } from "react";
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
  List,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  Filter,
} from "lucide-react";
import { MenuFormDialog } from "./form-dialog";

interface Menu {
  id: string;
  nama: string;
  slug: string;
  icon: string | null;
  urutan: number;
  is_published: number;
  deskripsi: string | null;
  halaman_count: number;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  published: number;
  draft: number;
}

export function MenuClient() {
  const [menu, setMenu] = useState<Menu[]>([]);
  const [filteredMenu, setFilteredMenu] = useState<Menu[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    draft: 0,
  });
  const [loading, setLoading] = useState(true);

  // Active filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Temporary filters for dialog
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [tempFilterStatus, setTempFilterStatus] = useState<string>("all");

  // Dialog states
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Check if filters are active
  const hasActiveFilters = searchTerm || filterStatus !== "all";

  // Fetch menu
  const fetchMenu = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterStatus !== "all") params.append("is_published", filterStatus);

      const response = await fetch(`/api/menu?${params}`);
      if (!response.ok) throw new Error("Failed to fetch menu");

      const data = await response.json();
      setMenu(data.menu);
      setFilteredMenu(data.menu);
      setStats(data.stats);
    } catch (error) {
      toast.error("Gagal memuat data menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [searchTerm, filterStatus]);

  // Handle filter dialog
  const handleOpenFilter = () => {
    setTempSearchTerm(searchTerm);
    setTempFilterStatus(filterStatus);
    setFilterDialogOpen(true);
  };

  const handleApplyFilters = () => {
    setSearchTerm(tempSearchTerm);
    setFilterStatus(tempFilterStatus);
    setFilterDialogOpen(false);
  };

  const handleResetFilters = () => {
    setTempSearchTerm("");
    setTempFilterStatus("all");
  };

  // Handle create
  const handleCreate = () => {
    setEditingMenu(null);
    setIsFormOpen(true);
  };

  // Handle edit
  const handleEdit = (item: Menu) => {
    setEditingMenu(item);
    setIsFormOpen(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!menuToDelete) return;

    try {
      setActionLoading(menuToDelete);
      const response = await fetch(`/api/menu/${menuToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete menu");

      toast.success("Menu berhasil dihapus");

      fetchMenu();
    } catch (error) {
      toast.error("Gagal menghapus menu");
    } finally {
      setActionLoading(null);
      setDeleteDialogOpen(false);
      setMenuToDelete(null);
    }
  };

  // Handle toggle publish
  const handleTogglePublish = async (id: string, currentStatus: number) => {
    try {
      setActionLoading(id);
      const response = await fetch(`/api/menu/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: currentStatus === 1 ? 0 : 1 }),
      });

      if (!response.ok) throw new Error("Failed to toggle publish");

      toast.success(
        `Menu berhasil ${currentStatus === 1 ? "di-draft" : "dipublikasikan"}`
      );

      fetchMenu();
    } catch (error) {
      toast.error("Gagal mengubah status");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle form success
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingMenu(null);
    fetchMenu();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Menu
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <List className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Daftar Menu
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
              Tambah Menu
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredMenu.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <List className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum ada menu</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Mulai dengan menambahkan menu pertama Anda
              </p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Menu
              </Button>
            </div>
          ) : (
            /* Data Table */
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Menu</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-center">Icon</TableHead>
                    <TableHead className="text-center">Urutan</TableHead>
                    <TableHead className="text-center">Halaman</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMenu.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.nama}</div>
                          {item.deskripsi && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {item.deskripsi}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {item.slug}
                        </code>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.icon ? (
                          <Badge variant="outline">{item.icon}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{item.urutan}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{item.halaman_count}</span>
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
                              setMenuToDelete(item.id);
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
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pencarian & Filter</DialogTitle>
            <DialogDescription>
              Sesuaikan pencarian dan status untuk daftar menu.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="menu-search">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="menu-search"
                  type="text"
                  placeholder="Cari menu..."
                  value={tempSearchTerm}
                  onChange={(e) => setTempSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
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
      <MenuFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingMenu={editingMenu}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Menu?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Menu dan semua halaman di
              dalamnya akan dihapus secara permanen.
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
