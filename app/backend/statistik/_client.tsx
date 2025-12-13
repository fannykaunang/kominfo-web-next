"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import {
  LucideIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
  Filter,
  TrendingUp,
} from "lucide-react";
import StatistikFormDialog from "./form-dialog";
import { Statistik, StatistikCreateInput } from "@/lib/types";

interface StatistikClientProps {
  initialStatistik: Statistik[];
  initialHighlights: Statistik[];
}

export default function StatistikClient({
  initialStatistik,
  initialHighlights,
}: StatistikClientProps) {
  const lucideIconMap = useMemo(
    () => LucideIcons as unknown as Record<string, LucideIcon>,
    []
  );

  const [statistik, setStatistik] = useState<Statistik[]>(initialStatistik);
  const [highlights, setHighlights] = useState<Statistik[]>(initialHighlights);

  // Active filters
  const [searchTerm, setSearchTerm] = useState("");

  // Temporary filters for dialog
  const [tempSearchTerm, setTempSearchTerm] = useState("");

  // Dialog states
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<Statistik | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if filters are active
  const hasActiveFilters = searchTerm !== "";

  const fetchStatistik = async (search?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      const res = await fetch(`/api/statistik?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat statistik");
      const data = await res.json();
      setStatistik(data.statistik || []);
      setHighlights(data.highlights || []);
    } catch (error) {
      console.error(error);
      toast.error("Tidak dapat memuat data statistik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setStatistik(initialStatistik);
    setHighlights(initialHighlights);
  }, [initialStatistik, initialHighlights]);

  // Handle filter dialog
  const handleOpenFilter = () => {
    setTempSearchTerm(searchTerm);
    setFilterDialogOpen(true);
  };

  const handleApplyFilters = () => {
    setSearchTerm(tempSearchTerm);
    fetchStatistik(tempSearchTerm);
    setFilterDialogOpen(false);
  };

  const handleResetFilters = () => {
    setTempSearchTerm("");
  };

  const handleCreate = () => {
    setEditingData(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: Statistik) => {
    setEditingData(item);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setSelectedId(id);
    setIsDeleteOpen(true);
  };

  const submitForm = async (data: StatistikCreateInput) => {
    try {
      const payload = {
        judul: data.judul,
        nilai: data.nilai,
        satuan: data.satuan,
        icon: data.icon,
        kategori: data.kategori,
        urutan: data.urutan,
      };

      const res = await fetch(
        editingData ? `/api/statistik/${editingData.id}` : "/api/statistik",
        {
          method: editingData ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan statistik");
      }

      toast.success(
        editingData
          ? "Statistik berhasil diperbarui"
          : "Statistik berhasil dibuat"
      );
      setIsFormOpen(false);
      setEditingData(null);
      fetchStatistik(searchTerm);
    } catch (error: any) {
      toast.error(error?.message || "Gagal menyimpan statistik");
    }
  };

  const confirmDelete = async () => {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/statistik/${selectedId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menghapus statistik");
      }
      toast.success("Statistik berhasil dihapus");
      setIsDeleteOpen(false);
      setSelectedId(null);
      fetchStatistik(searchTerm);
    } catch (error: any) {
      toast.error(error?.message || "Gagal menghapus statistik");
    }
  };

  const cards = useMemo(() => highlights.slice(0, 4), [highlights]);

  const renderIcon = (iconName?: string | null, className = "h-4 w-4") => {
    if (!iconName) return null;

    const aliasMap: Record<string, string> = {
      trending: "TrendingUp",
      users: "Users",
      building: "Building",
    };

    const normalizedName = iconName.replace(/-([a-z])/g, (_, c) =>
      c.toUpperCase()
    );
    const candidates = [
      iconName,
      normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1),
      aliasMap[iconName.toLowerCase()],
    ].filter(Boolean) as string[];

    const IconComponent = candidates
      .map((name) => lucideIconMap[name])
      .find(Boolean);

    if (!IconComponent) {
      return (
        <span className="text-xs font-medium text-muted-foreground">
          {iconName}
        </span>
      );
    }

    return <IconComponent className={className} aria-hidden="true" />;
  };

  return (
    <div className="space-y-6">
      {/* Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {item.kategori || item.judul}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {item.nilai}
                    {item.satuan && (
                      <span className="text-base ml-1">{item.satuan}</span>
                    )}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  {renderIcon(
                    item.icon,
                    "h-6 w-6 text-blue-600 dark:text-blue-400"
                  ) || (
                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Daftar Statistik
          </CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              variant={hasActiveFilters ? "default" : "outline"}
              onClick={handleOpenFilter}
              className="gap-2"
              disabled={loading}
            >
              <Filter className="h-4 w-4" />
              Filter & Pencarian
              {hasActiveFilters && <Badge variant="secondary">Aktif</Badge>}
            </Button>
            <Button onClick={handleCreate} className="gap-2" disabled={loading}>
              <Plus className="h-4 w-4" />
              Tambah Statistik
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>JUDUL</TableHead>
                  <TableHead>NILAI</TableHead>
                  <TableHead>KATEGORI</TableHead>
                  <TableHead>ICON</TableHead>
                  <TableHead className="text-center">URUTAN</TableHead>
                  <TableHead className="text-center">AKSI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statistik.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          Tidak ada statistik
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Belum ada data statistik yang tersedia
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  statistik.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.judul}
                      </TableCell>
                      <TableCell>
                        {item.nilai}
                        {item.satuan ? ` ${item.satuan}` : ""}
                      </TableCell>
                      <TableCell className="capitalize">
                        {item.kategori}
                      </TableCell>
                      <TableCell>
                        {item.icon ? (
                          <div className="flex items-center gap-2">
                            {renderIcon(item.icon, "h-5 w-5")}
                            <span className="capitalize text-sm text-muted-foreground">
                              {item.icon}
                            </span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.urutan}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            disabled={loading}
                            className="h-8 w-8 p-0"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                            title="Hapus"
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
        </CardContent>
      </Card>

      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onOpenChange={(open) => {
          setFilterDialogOpen(open);
          if (open) {
            setTempSearchTerm(searchTerm);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pencarian & Filter</DialogTitle>
            <DialogDescription>
              Cari data statistik berdasarkan judul atau kategori.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="statistik-search">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="statistik-search"
                  type="text"
                  placeholder="Cari statistik..."
                  value={tempSearchTerm}
                  onChange={(e) => setTempSearchTerm(e.target.value)}
                  className="pl-10"
                />
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
      <StatistikFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={submitForm}
        initialData={editingData}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus statistik?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Statistik yang dihapus akan
              hilang dari tampilan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ya, hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
