"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Video,
  Eye,
  ImageOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Skeleton } from "@/components/ui/skeleton";
import { GaleriFormDialog } from "./form-dialog";

interface Galeri {
  id: string;
  judul: string;
  deskripsi: string | null;
  media_type: "image" | "video";
  media_url: string;
  thumbnail: string | null;
  kategori: string;
  is_published: number;
  urutan: number;
  views: number;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  published: number;
  draft: number;
  total_images: number;
  total_videos: number;
  total_views: number;
}

// Parse media_url (JSON array for images or string for video)
const parseMediaUrl = (item: Galeri): string[] | string => {
  if (item.media_type === "image") {
    try {
      const parsed = JSON.parse(item.media_url);
      return Array.isArray(parsed) ? parsed : [item.media_url];
    } catch {
      return [item.media_url];
    }
  }
  return item.media_url;
};

// Get first image from array
const getFirstImage = (mediaUrl: string[] | string): string => {
  if (Array.isArray(mediaUrl)) {
    return mediaUrl[0] || "";
  }
  return mediaUrl;
};

export function GaleriClient() {
  const [galeri, setGaleri] = useState<Galeri[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    draft: 0,
    total_images: 0,
    total_videos: 0,
    total_views: 0,
  });
  const [kategoriList, setKategoriList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("all");
  const [filterMediaType, setFilterMediaType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingGaleri, setEditingGaleri] = useState<Galeri | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Fetch galeri data
  const fetchGaleri = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterKategori !== "all") params.append("kategori", filterKategori);
      if (filterMediaType !== "all")
        params.append("media_type", filterMediaType);
      if (filterStatus !== "all")
        params.append("is_published", filterStatus === "published" ? "1" : "0");

      const response = await fetch(`/api/galeri?${params}`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setGaleri(data.galeri || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal memuat data galeri");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchKategori = async () => {
    try {
      const response = await fetch("/api/galeri/kategori");
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setKategoriList(data.kategori || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchGaleri();
    fetchKategori();
  }, [search, filterKategori, filterMediaType, filterStatus]);

  // Delete galeri
  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/galeri/${deleteId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Galeri berhasil dihapus");
      setDeleteId(null);
      fetchGaleri();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal menghapus galeri");
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle publish status
  const handleTogglePublish = async (id: string, currentStatus: number) => {
    try {
      const response = await fetch(`/api/galeri/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: currentStatus === 1 ? 0 : 1 }),
      });

      if (!response.ok) throw new Error("Failed to update");

      toast.success(
        `Galeri berhasil ${currentStatus === 1 ? "di-draft" : "dipublikasikan"}`
      );
      fetchGaleri();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal mengubah status");
    }
  };

  // Handle edit
  const handleEdit = (item: Galeri) => {
    setEditingGaleri(item);
    setIsFormOpen(true);
  };

  // Handle add new
  const handleAdd = () => {
    setEditingGaleri(null);
    setIsFormOpen(true);
  };

  // Handle form close
  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingGaleri(null);
    fetchGaleri();
  };

  // Get YouTube video ID
  const getYouTubeVideoId = (url: string) => {
    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Truncate text
  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Item galeri</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.published}
            </div>
            <p className="text-xs text-muted-foreground">Dipublikasikan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <ImageOff className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.draft}
            </div>
            <p className="text-xs text-muted-foreground">Belum publish</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.total_images}
            </div>
            <p className="text-xs text-muted-foreground">Total foto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Videos</CardTitle>
            <Video className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.total_videos}
            </div>
            <p className="text-xs text-muted-foreground">Total video</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Views</CardTitle>
            <Eye className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {stats.total_views}
            </div>
            <p className="text-xs text-muted-foreground">Total views</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari judul, deskripsi, atau kategori..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Kategori */}
            <Select value={filterKategori} onValueChange={setFilterKategori}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {kategoriList.map((kat) => (
                  <SelectItem key={kat} value={kat}>
                    {kat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filter Media Type */}
            <Select value={filterMediaType} onValueChange={setFilterMediaType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Tipe Media" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Status */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            {/* Add Button */}
            <Button onClick={handleAdd} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Tambah
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : galeri.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum ada galeri</h3>
              <p className="text-muted-foreground text-center mb-4">
                Mulai dengan menambahkan foto atau video pertama Anda
              </p>
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Galeri
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Preview</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-center">Views</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Publish</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {galeri.map((item) => (
                    <TableRow key={item.id}>
                      {/* Preview */}
                      <TableCell>
                        {item.media_type === "image" ? (
                          <div className="w-16 h-16 bg-muted rounded overflow-hidden relative">
                            {(() => {
                              const images = parseMediaUrl(item);
                              const firstImage = getFirstImage(images);
                              const imageCount = Array.isArray(images)
                                ? images.length
                                : 1;

                              return (
                                <>
                                  <img
                                    src={firstImage}
                                    alt={item.judul}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        "/images/placeholder.png";
                                    }}
                                  />
                                  {imageCount > 1 && (
                                    <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
                                      +{imageCount - 1}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded overflow-hidden relative">
                            {item.thumbnail ? (
                              <img
                                src={item.thumbnail}
                                alt={item.judul}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Video className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Video className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        )}
                      </TableCell>

                      {/* Judul */}
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.judul}</div>
                          {item.deskripsi && (
                            <div className="text-sm text-muted-foreground">
                              {truncate(item.deskripsi, 60)}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Tipe */}
                      <TableCell>
                        <Badge
                          variant={
                            item.media_type === "image"
                              ? "default"
                              : "secondary"
                          }>
                          {item.media_type === "image" ? (
                            <>
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Image
                            </>
                          ) : (
                            <>
                              <Video className="h-3 w-3 mr-1" />
                              Video
                            </>
                          )}
                        </Badge>
                      </TableCell>

                      {/* Kategori */}
                      <TableCell>
                        <Badge variant="outline">{item.kategori}</Badge>
                      </TableCell>

                      {/* Views */}
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span>{item.views}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            item.is_published === 1 ? "default" : "secondary"
                          }>
                          {item.is_published === 1 ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>

                      {/* Publish Toggle */}
                      <TableCell className="text-center">
                        <Switch
                          checked={item.is_published === 1}
                          onCheckedChange={() =>
                            handleTogglePublish(item.id, item.is_published)
                          }
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(item.id)}>
                            <Trash2 className="h-4 w-4" />
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
      <GaleriFormDialog
        open={isFormOpen}
        onClose={handleFormClose}
        galeri={editingGaleri}
        kategoriList={kategoriList}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Galeri?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus item galeri ini? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
