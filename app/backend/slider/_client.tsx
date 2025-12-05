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
} from "lucide-react";
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
import SliderFormDialog, { SliderFormValues } from "./form-dialog";

interface SliderItem {
  id: string;
  judul: string;
  deskripsi: string | null;
  image: string;
  is_published: number;
  created_at: string;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<SliderItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sliderToDelete, setSliderToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handleCreate = () => {
    setEditingSlider(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: SliderItem) => {
    setEditingSlider(item);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: SliderFormValues) => {
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
        editingSlider ? "Slider berhasil diperbarui" : "Slider berhasil dibuat"
      );
      setIsFormOpen(false);
      setEditingSlider(null);
      fetchSliders();
    } catch (error) {
      toast.error("Gagal menyimpan slider");
    } finally {
      setActionLoading(null);
    }
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Slider</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Semua slider</p>
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
              Slider dipublikasikan
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
            <p className="text-xs text-muted-foreground">Slider belum publik</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari slider..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="1">Published</SelectItem>
              <SelectItem value="0">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Tambah Slider
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Gambar</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memuat data slider...
                  </div>
                </TableCell>
              </TableRow>
            ) : sliders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  Tidak ada slider ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              sliders.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.judul}</TableCell>
                  <TableCell className="max-w-md text-muted-foreground">
                    {item.deskripsi || "-"}
                  </TableCell>
                  <TableCell>
                    <a
                      href={item.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Lihat Gambar
                    </a>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Badge
                        variant={
                          item.is_published === 1 ? "default" : "secondary"
                        }
                      >
                        {item.is_published === 1 ? "Published" : "Draft"}
                      </Badge>
                      <Switch
                        checked={item.is_published === 1}
                        onCheckedChange={() => handleTogglePublish(item)}
                        disabled={actionLoading === item.id}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      disabled={actionLoading === item.id}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSliderToDelete(item.id);
                        setDeleteDialogOpen(true);
                      }}
                      disabled={actionLoading === item.id}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SliderFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={editingSlider}
      />

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
            <AlertDialogAction onClick={handleDelete}>
              {actionLoading === sliderToDelete ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
