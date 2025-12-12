// app/backend/slider/_client.tsx

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Loader2,
  Filter,
  Image,
} from "lucide-react";
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
import SliderFormDialog from "./form-dialog";
import { ImageLightbox } from "@/components/galeri/image-lightbox";

interface SliderItem {
  id: string;
  judul: string;
  deskripsi: string | null;
  image: string;
  is_published: number;
  created_at: string;
}

interface SliderFormValues {
  judul: string;
  deskripsi: string;
  image: string;
  is_published: number;
}

interface Stats {
  total: number;
  published: number;
  draft: number;
}

export default function SliderClient() {
  const [sliders, setSliders] = useState<SliderItem[]>([]);
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
  const [editingSlider, setEditingSlider] = useState<SliderItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sliderToDelete, setSliderToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Check if filters are active
  const hasActiveFilters = searchTerm || filterStatus !== "all";

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (filterStatus !== "all") params.append("is_published", filterStatus);

      const response = await fetch(`/api/slider?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch sliders");

      const data = await response.json();
      setSliders(data.sliders || []);
      setStats(data.stats || { total: 0, published: 0, draft: 0 });
    } catch (error) {
      toast.error("Gagal memuat data slider");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleCreate = () => {
    setEditingSlider(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: SliderItem) => {
    setEditingSlider(item);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingSlider(null);
    fetchSliders();
  };

  const handleViewImage = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleDelete = async () => {
    if (!sliderToDelete) return;

    try {
      setActionLoading(sliderToDelete);
      const response = await fetch(`/api/slider/${sliderToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete slider");

      toast.success("Slider berhasil dihapus");
      fetchSliders();
    } catch (error) {
      toast.error("Gagal menghapus slider");
    } finally {
      setActionLoading(null);
      setDeleteDialogOpen(false);
      setSliderToDelete(null);
    }
  };

  const handleTogglePublish = async (item: SliderItem) => {
    if (item.is_published === 0) {
      const confirmPublish = confirm("apakah ingin mem-published slider ini?");
      if (!confirmPublish) return;
    }

    try {
      setActionLoading(item.id);
      const response = await fetch(`/api/slider/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: item.is_published === 1 ? 0 : 1 }),
      });

      if (!response.ok) throw new Error("Failed to toggle publish");

      toast.success(
        `Slider berhasil ${
          item.is_published === 1 ? "di-draft" : "dipublikasikan"
        }`
      );
      fetchSliders();
    } catch (error) {
      toast.error("Gagal mengubah status slider");
    } finally {
      setActionLoading(null);
    }
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
                  Total Slider
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
            <ImageIcon className="h-5 w-5" />
            Daftar Slider
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
              Tambah Slider
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </div>
          ) : sliders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum ada slider</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Mulai dengan menambahkan slider pertama Anda
              </p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Slider
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sliders.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.judul}
                      </TableCell>
                      <TableCell className="max-w-md text-muted-foreground">
                        {item.deskripsi || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={item.is_published === 1}
                            onCheckedChange={() => handleTogglePublish(item)}
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
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewImage(index)}
                            className="h-8 w-8 p-0"
                            title="Lihat Gambar"
                          >
                            <Image className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            disabled={actionLoading === item.id}
                            className="h-8 w-8 p-0"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSliderToDelete(item.id);
                              setDeleteDialogOpen(true);
                            }}
                            disabled={actionLoading === item.id}
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                            title="Hapus"
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
              Sesuaikan pencarian dan status untuk daftar slider.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slider-search">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="slider-search"
                  type="text"
                  placeholder="Cari slider..."
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
                  <SelectItem value="all">Semua</SelectItem>
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
      <SliderFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={async (values: SliderFormValues) => {
          try {
            setActionLoading("form");
            const method = editingSlider ? "PUT" : "POST";
            const url = editingSlider
              ? `/api/slider/${editingSlider.id}`
              : "/api/slider";

            const response = await fetch(url, {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...values,
                deskripsi: values.deskripsi || null,
              }),
            });

            if (!response.ok) throw new Error("Failed to save slider");

            toast.success(
              editingSlider
                ? "Slider berhasil diperbarui"
                : "Slider berhasil dibuat"
            );
            handleFormSuccess();
          } catch (error) {
            toast.error("Gagal menyimpan slider");
          } finally {
            setActionLoading(null);
          }
        }}
        initialData={editingSlider}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Slider</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus slider ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading === sliderToDelete ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Ya, Hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Lightbox */}
      <ImageLightbox
        images={sliders.map((slider) => slider.image)}
        titles={sliders.map((slider) => slider.judul)}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
