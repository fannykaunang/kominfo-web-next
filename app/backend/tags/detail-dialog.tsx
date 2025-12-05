"use client";

import { useState, useEffect } from "react";
import { ExternalLink, FileText, Calendar, FolderOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tag, BeritaTag } from "@/lib/types";

interface TagDetailDialogProps {
  open: boolean;
  onClose: () => void;
  tag: Tag | null;
}

export function TagDetailDialog({ open, onClose, tag }: TagDetailDialogProps) {
  const [berita, setBerita] = useState<BeritaTag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && tag) {
      fetchBerita();
    }
  }, [open, tag]);

  const fetchBerita = async () => {
    if (!tag) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/tags/${tag.id}/berita`);
      if (res.ok) {
        const data = await res.json();
        setBerita(data.berita);
      }
    } catch (error) {
      console.error("Error fetching berita:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  if (!tag) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Detail Tag: {tag.nama}
          </DialogTitle>
          <DialogDescription>
            Daftar berita yang menggunakan tag ini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {/* Tag Info */}
          <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-950 dark:to-indigo-950">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Nama Tag
                </label>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {tag.nama}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Slug
                </label>
                <code className="block text-sm text-gray-900 dark:text-white">
                  {tag.slug}
                </code>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Jumlah Berita
                </label>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {tag.berita_count || 0} berita
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Dibuat
                </label>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDate(tag.created_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Berita List */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
              Daftar Berita ({berita.length})
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
              </div>
            ) : berita.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 py-12 dark:bg-gray-900">
                <FileText className="mb-3 h-12 w-12 text-gray-400" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Tidak ada berita
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tag ini belum digunakan di berita manapun
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {berita.map((item) => (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-lg border bg-white p-4 transition-all hover:shadow-md dark:bg-gray-800"
                  >
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      {item.thumbnail && (
                        <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                          <img
                            src={item.thumbnail}
                            alt={item.judul}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">
                            {item.judul}
                          </h4>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                          {item.kategori_nama && (
                            <div className="flex items-center gap-1">
                              <FolderOpen className="h-3 w-3" />
                              <span>{item.kategori_nama}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {formatDate(item.published_at || item.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Link */}
                        <a
                          href={`/berita/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                        >
                          <span>Lihat berita</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
