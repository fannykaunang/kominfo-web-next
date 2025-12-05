"use client";

import { useEffect, useMemo, useState } from "react";
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
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import { LucideIcon, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingData, setEditingData] = useState<Statistik | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleApplySearch = () => {
    fetchStatistik(searchTerm);
  };

  const handleResetSearch = () => {
    setSearchTerm("");
    fetchStatistik("");
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
      building: "Building", // fallback when source uses lowercase names
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((item) => (
          <Card key={item.id} className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {item.kategori || "-"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2">
                <div className="text-lg font-semibold">{item.judul}</div>
                {renderIcon(item.icon, "h-6 w-6 text-primary")}
              </div>
              <div className="text-3xl font-bold mt-2">
                {item.nilai}
                {item.satuan ? (
                  <span className="text-base ml-1">{item.satuan}</span>
                ) : null}
              </div>
              {item.icon ? (
                <Badge
                  variant="secondary"
                  className="mt-3 inline-flex items-center gap-2"
                >
                  {renderIcon(item.icon, "h-4 w-4")}
                  <span className="capitalize">{item.icon}</span>
                </Badge>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari statistik"
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={handleApplySearch}
            disabled={loading}
          >
            Terapkan
          </Button>
          <Button
            variant="ghost"
            onClick={handleResetSearch}
            disabled={loading}
          >
            Reset
          </Button>
        </div>
        <Button onClick={handleCreate} className="md:w-auto" disabled={loading}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Statistik
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold">
              Daftar Statistik
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Edit atau hapus data statistik sesuai kebutuhan.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Tidak ada data statistik.
                  </TableCell>
                </TableRow>
              ) : (
                statistik.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.judul}</TableCell>
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
                    <TableCell className="text-center space-x-2">
                      {item.urutan}
                    </TableCell>
                    <TableCell className="text-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                        disabled={loading}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <StatistikFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={submitForm}
        initialData={editingData}
      />

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
