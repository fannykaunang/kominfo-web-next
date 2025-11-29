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
  FolderOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import KategoriModal from "./kategori-modal";
import DeleteKategoriDialog from "./delete-kategori-dialog";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface KategoriClientProps {
  initialKategori: Kategori[];
  initialStats: {
    total: number;
    used: number;
    unused: number;
  };
}

export default function KategoriClient({
  initialKategori,
  initialStats,
}: KategoriClientProps) {
  const [kategori, setKategori] = useState<Kategori[]>(initialKategori);
  const [stats, setStats] = useState(initialStats);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState<Kategori | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Filter kategori based on search
  const filteredKategori = kategori.filter(
    (k) =>
      k.nama.toLowerCase().includes(search.toLowerCase()) ||
      k.slug.toLowerCase().includes(search.toLowerCase()) ||
      k.deskripsi?.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Kelola Kategori
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage kategori berita untuk website
          </p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

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
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Daftar Kategori
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
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
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKategori.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500">
                      {search
                        ? "Kategori tidak ditemukan"
                        : "Belum ada kategori"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredKategori.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: k.color || undefined }}>
                            {k.icon ? (
                              <span className="text-sm">{k.icon}</span>
                            ) : (
                              <FolderOpen className="h-5 w-5" />
                            )}
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
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDistanceToNow(new Date(k.created_at), {
                          addSuffix: true,
                          locale: idLocale,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(k)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(k)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50">
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
            Menampilkan {filteredKategori.length} dari {kategori.length}{" "}
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
  );
}
