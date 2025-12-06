// app/backend/kategori/_client.tsx

"use client";

import { useState } from "react";
import { Kategori } from "@/lib/types";
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
  FolderOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  Check,
  XCircle,
  Filter,
  type LucideIcon,
} from "lucide-react";
import * as Icons from "lucide-react";
import { Badge } from "@/components/ui/badge";
import KategoriModal from "./kategori-modal";
import DeleteKategoriDialog from "./delete-kategori-dialog";
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

interface KategoriClientProps {
  initialKategori: Kategori[];
  initialStats: {
    total: number;
    used: number;
    unused: number;
  };
}

const isLucideIcon = (value: unknown): value is LucideIcon =>
  typeof value === "function" ||
  (typeof value === "object" && value !== null && "render" in value);

const iconsMap: Record<string, LucideIcon> = Object.fromEntries(
  Object.entries(Icons).filter(([, value]) => isLucideIcon(value))
) as Record<string, LucideIcon>;

const resolveIcon = (icon?: string | null): LucideIcon | null => {
  if (!icon) return null;

  const normalized = icon.trim();
  if (!normalized) return null;

  // Try direct match (e.g. "FolderOpen")
  if (iconsMap[normalized]) {
    return iconsMap[normalized];
  }

  // Try converting kebab/space cases to PascalCase (e.g. "folder-open" -> "FolderOpen")
  const pascalCase = normalized
    .split(/[\s-_]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return iconsMap[pascalCase] || null;
};

export default function KategoriClient({
  initialKategori,
  initialStats,
}: KategoriClientProps) {
  const [kategori, setKategori] = useState<Kategori[]>(initialKategori);
  const [stats, setStats] = useState(initialStats);
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState<"none" | "asc" | "desc">("none");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState<Kategori | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const hasActiveFilters =
    search || orderBy !== "none" || statusFilter !== "all" ? true : false;

  // Filter kategori based on search and status
  const filteredKategori = kategori.filter((k) => {
    const matchesSearch = search
      ? k.nama.toLowerCase().includes(search.toLowerCase()) ||
        k.slug.toLowerCase().includes(search.toLowerCase()) ||
        k.deskripsi?.toLowerCase().includes(search.toLowerCase())
      : true;

    const beritaCount = k.berita_count || 0;
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? beritaCount > 0
        : beritaCount === 0;

    return matchesSearch && matchesStatus;
  });

  // Sort based on berita usage
  const sortedKategori = [...filteredKategori].sort((a, b) => {
    if (orderBy === "none") return 0;

    const countA = a.berita_count || 0;
    const countB = b.berita_count || 0;

    return orderBy === "desc" ? countB - countA : countA - countB;
  });

  // Refresh data from server
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [kategoriRes, statsRes] = await Promise.all([
        fetch("/api/kategori"),
        fetch("/api/kategori?stats=true"),
      ]);

      if (kategoriRes.ok) {
        const data = await kategoriRes.json();
        setKategori(data);
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

  const handleEdit = (kategori: Kategori) => {
    setSelectedKategori(kategori);
    setIsModalOpen(true);
  };

  const handleDelete = (kategori: Kategori) => {
    setSelectedKategori(kategori);
    setIsDeleteOpen(true);
  };

  const handleAddNew = () => {
    setSelectedKategori(null);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    refreshData();
    setIsModalOpen(false);
    setIsDeleteOpen(false);
    setSelectedKategori(null);
  };

  const handleClearFilters = () => {
    setSearch("");
    setOrderBy("none");
    setStatusFilter("all");
    setIsFilterOpen(false);
  };

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight"> Kelola Kategori</h1>
        <p className="text-muted-foreground mt-2">
          Manage kategori berita untuk website
        </p>
      </div>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Kategori
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.total}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Kategori Digunakan
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
                    Kategori Tidak Digunakan
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stats.unused}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Daftar Kategori
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
                    {hasActiveFilters && (
                      <Badge variant="secondary">Aktif</Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filter & Pencarian
                    </DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Pencarian</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="search"
                          placeholder="Cari kategori..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Urutkan Penggunaan</Label>
                      <Select
                        value={orderBy}
                        onValueChange={(v) => setOrderBy(v as typeof orderBy)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Urutkan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Tanpa Urutan</SelectItem>
                          <SelectItem value="desc">Berita Terbanyak</SelectItem>
                          <SelectItem value="asc">
                            Berita Paling Sedikit
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={statusFilter}
                        onValueChange={(v) =>
                          setStatusFilter(v as typeof statusFilter)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Status</SelectItem>
                          <SelectItem value="active">Aktif</SelectItem>
                          <SelectItem value="inactive">Tidak Aktif</SelectItem>
                        </SelectContent>
                      </Select>
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

              <Button onClick={handleAddNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Kategori
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-center">Berita</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedKategori.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        {hasActiveFilters
                          ? "Kategori tidak ditemukan"
                          : "Belum ada kategori"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedKategori.map((k) => (
                      <TableRow key={k.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="h-10 w-10 rounded-lg flex items-center justify-center text-white"
                              style={{ backgroundColor: k.color || undefined }}
                            >
                              {(() => {
                                const IconComponent = resolveIcon(k.icon);

                                if (IconComponent) {
                                  return <IconComponent className="h-5 w-5" />;
                                }

                                if (k.icon) {
                                  return (
                                    <span className="text-lg">{k.icon}</span>
                                  );
                                }

                                return <FolderOpen className="h-5 w-5" />;
                              })()}
                            </div>
                            <div>
                              <div className="font-medium">{k.nama}</div>
                              <div className="text-xs text-gray-500">
                                {k.color}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {k.slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-400">
                            {k.deskripsi || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {k.berita_count || 0} berita
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {(k.berita_count || 0) > 0 ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Aktif
                            </Badge>
                          ) : (
                            <Badge variant="outline">Tidak Digunakan</Badge>
                          )}
                        </TableCell>
                        <TableCell
                          className="text-sm text-gray-600 dark:text-gray-400"
                          title={formatDate(new Date(k.created_at).toString())}
                        >
                          {formatDistanceToNow(new Date(k.created_at), {
                            addSuffix: true,
                            locale: idLocale,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(k)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(k)}
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

            {/* Summary */}
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Menampilkan {sortedKategori.length} dari {kategori.length}{" "}
              kategori
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <KategoriModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          kategori={selectedKategori}
          onSuccess={handleSuccess}
        />

        <DeleteKategoriDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          kategori={selectedKategori}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
