// app/backend/skpd/_client.tsx

"use client";

import { useState } from "react";
import { SKPD } from "@/lib/types";
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
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  FileText,
  FolderOpen,
  Shield,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SKPDModal from "./skpd-modal";
import DeleteSKPDDialog from "./delete-dialog";
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

interface SKPDClientProps {
  initialSKPD: SKPD[];
  initialStats: {
    total: number;
    setda: number;
    sekretariat_dprd: number;
    dinas: number;
    lembaga_teknis: number;
    uptd: number;
    satuan: number;
    distrik: number;
    kelurahan: number;
  };
}

export default function SKPDClient({
  initialSKPD,
  initialStats,
}: SKPDClientProps) {
  const [skpdList, setSKPDList] = useState<SKPD[]>(initialSKPD);
  const [stats, setStats] = useState(initialStats);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<
    | "all"
    | "Setda"
    | "Sekretariat DPRD"
    | "Dinas"
    | "Lembaga Teknis"
    | "UPTD"
    | "Satuan"
    | "Distrik"
    | "Kelurahan"
  >("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSKPD, setSelectedSKPD] = useState<SKPD | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasActiveFilters = search || kategoriFilter !== "all";

  // Filter SKPD based on search and kategori
  const filteredSKPD = skpdList.filter((s) => {
    const matchesSearch = search
      ? s.nama.toLowerCase().includes(search.toLowerCase()) ||
        s.singkatan.toLowerCase().includes(search.toLowerCase()) ||
        s.kepala?.toLowerCase().includes(search.toLowerCase()) ||
        s.alamat?.toLowerCase().includes(search.toLowerCase())
      : true;

    const matchesKategori =
      kategoriFilter === "all" ? true : s.kategori === kategoriFilter;

    return matchesSearch && matchesKategori;
  });

  // Refresh data from server
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [skpdRes, statsRes] = await Promise.all([
        fetch("/api/skpd"),
        fetch("/api/skpd?stats=true"),
      ]);

      if (skpdRes.ok) {
        const data = await skpdRes.json();
        setSKPDList(data);
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

  const formatDate = (dateString: Date) => {
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

  const handleEdit = (skpd: SKPD) => {
    setSelectedSKPD(skpd);
    setIsModalOpen(true);
  };

  const handleDelete = (skpd: SKPD) => {
    setSelectedSKPD(skpd);
    setIsDeleteOpen(true);
  };

  const handleAddNew = () => {
    setSelectedSKPD(null);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    refreshData();
    setIsModalOpen(false);
    setIsDeleteOpen(false);
    setSelectedSKPD(null);
  };

  const handleClearFilters = () => {
    setSearch("");
    setKategoriFilter("all");
    setIsFilterOpen(false);
  };

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
  };

  const getKategoriBadgeColor = (kategori: string) => {
    switch (kategori) {
      case "Setda":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "Sekretariat DPRD":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200";
      case "Dinas":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Lembaga Teknis":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "UPTD":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "Distrik":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Kelurahan":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      default:
        return "";
    }
  };

  const getKategoriIcon = (kategori: string) => {
    switch (kategori) {
      case "Setda":
        return <FileText className="h-5 w-5" />;
      case "Sekretariat DPRD":
        return <Users className="h-5 w-5" />;
      case "Dinas":
        return <Building2 className="h-5 w-5" />;
      case "Lembaga Teknis":
        return <FolderOpen className="h-5 w-5" />;
      case "UPTD":
        return <Shield className="h-5 w-5" />;
      case "Satuan":
        return <Users className="h-5 w-5" />;
      case "Distrik":
        return <Users className="h-5 w-5" />;
      case "Kelurahan":
        return <Users className="h-5 w-5" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Kelola SKPD</h1>
        <p className="text-muted-foreground mt-2">
          Manage Satuan Kerja Perangkat Daerah
        </p>
      </div>

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.total}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Setda
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.setda}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Sekretariat DPRD
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.sekretariat_dprd}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Dinas
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.dinas}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Lembaga Teknis
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.lembaga_teknis}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    UPTD
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.uptd}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Distrik
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.distrik}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Kelurahan
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.kelurahan}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Daftar SKPD
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
                          placeholder="Cari SKPD..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Kategori</Label>
                      <Select
                        value={kategoriFilter}
                        onValueChange={(v) =>
                          setKategoriFilter(v as typeof kategoriFilter)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Semua Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Kategori</SelectItem>
                          <SelectItem value="Setda">Setda</SelectItem>
                          <SelectItem value="Sekretariat DPRD">
                            Sekretariat DPRD
                          </SelectItem>
                          <SelectItem value="Dinas">Dinas</SelectItem>
                          <SelectItem value="Lembaga Teknis">
                            Lembaga Teknis
                          </SelectItem>
                          <SelectItem value="UPTD">UPTD</SelectItem>
                          <SelectItem value="Distrik">Distrik</SelectItem>
                          <SelectItem value="Kelurahan">Kelurahan</SelectItem>
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
                Tambah SKPD
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKPD</TableHead>
                    <TableHead>Singkatan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Kepala</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSKPD.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        {hasActiveFilters
                          ? "SKPD tidak ditemukan"
                          : "Belum ada SKPD"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSKPD.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                              {getKategoriIcon(s.kategori)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {s.nama}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {s.alamat || "-"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{s.singkatan}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getKategoriBadgeColor(s.kategori)}>
                            {s.kategori}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm">
                            {s.kepala || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            {s.telepon && (
                              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <span className="text-xs">📞</span>
                                {s.telepon}
                              </div>
                            )}
                            {s.email && (
                              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <span className="text-xs">✉️</span>
                                {s.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell
                          className="text-sm text-gray-600 dark:text-gray-400"
                          title={formatDate(s.created_at)}
                        >
                          {formatDistanceToNow(new Date(s.created_at), {
                            addSuffix: true,
                            locale: idLocale,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(s)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(s)}
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
              Menampilkan {filteredSKPD.length} dari {skpdList.length} SKPD
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <SKPDModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          skpd={selectedSKPD}
          onSuccess={handleSuccess}
        />

        <DeleteSKPDDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          skpd={selectedSKPD}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  );
}
