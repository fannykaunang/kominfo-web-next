"use client";

import { useState, useEffect } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { HalamanFormDialog } from "./form-dialog";

interface Halaman {
  id: string;
  menu_id: string;
  judul: string;
  slug: string;
  konten: string;
  excerpt: string | null;
  urutan: number;
  is_published: number;
  views: number;
  meta_title: string | null;
  meta_description: string | null;
  author_id: string | null;
  menu_nama: string;
  menu_slug: string;
  author_name: string | null;
  created_at: string;
  updated_at: string;
}

interface Menu {
  id: string;
  nama: string;
}

interface Stats {
  total: number;
  published: number;
  draft: number;
  total_views: number;
}

export function HalamanClient() {
  const [halaman, setHalaman] = useState<Halaman[]>([]);
  const [filteredHalaman, setFilteredHalaman] = useState<Halaman[]>([]);
  const [menu, setMenu] = useState<Menu[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    draft: 0,
    total_views: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMenu, setFilterMenu] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHalaman, setEditingHalaman] = useState<Halaman | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [halamanToDelete, setHalamanToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch menu for filter
  const fetchMenu = async () => {
    try {
      const response = await fetch("/api/menu");
      if (!response.ok) throw new Error("Failed to fetch menu");
      const data = await response.json();
      setMenu(data.menu);
    } catch (error) {
      console.error("Error fetching menu:", error);
    }
  };

  // Fetch halaman
  const fetchHalaman = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterStatus !== "all") params.append("is_published", filterStatus);
      if (filterMenu !== "all") params.append("menu_id", filterMenu);

      const response = await fetch(`/api/halaman?${params}`);
      if (!response.ok) throw new Error("Failed to fetch halaman");

      const data = await response.json();
      setHalaman(data.halaman);
      setFilteredHalaman(data.halaman);
      setStats(data.stats);
    } catch (error) {
      toast.error("Gagal memuat data halaman");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    fetchHalaman();
  }, [searchTerm, filterStatus, filterMenu]);

  // Handle create
  const handleCreate = () => {
    setEditingHalaman(null);
    setIsFormOpen(true);
  };

  // Handle edit
  const handleEdit = (item: Halaman) => {
    setEditingHalaman(item);
    setIsFormOpen(true);
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Halaman</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Semua halaman di sistem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
            <p className="text-xs text-muted-foreground">
              Halaman dipublikasikan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">
              Belum dipublikasikan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_views.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total kunjungan halaman
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>Kelola Halaman</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Kelola konten halaman website
              </p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Halaman
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari halaman..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterMenu} onValueChange={setFilterMenu}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter Menu" />
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
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="1">Published</SelectItem>
                  <SelectItem value="0">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredHalaman.length === 0 ? (
            /* Empty State */
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
            /* Data Table */
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
                            }>
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
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                            disabled={actionLoading === item.id}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setHalamanToDelete(item.id);
                              setDeleteDialogOpen(true);
                            }}
                            disabled={actionLoading === item.id}>
                            {actionLoading === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
