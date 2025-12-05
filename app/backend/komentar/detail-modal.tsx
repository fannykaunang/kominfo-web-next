import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { KomentarWithBerita } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

interface KomentarDetailModalProps {
  komentar: KomentarWithBerita | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function KomentarDetailModal({
  komentar,
  open,
  onOpenChange,
}: KomentarDetailModalProps) {
  if (!komentar) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detail Komentar</DialogTitle>
          <DialogDescription>
            Informasi komentar beserta berita yang dikomentari
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">{komentar.nama}</p>
              <p className="text-sm text-gray-500">{komentar.email}</p>
            </div>
            {komentar.is_approved ? (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200">
                Disetujui
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                Menunggu
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-500">Isi Komentar</p>
            <p className="rounded-lg border p-3 bg-gray-50 dark:bg-gray-900/40 dark:border-gray-800 whitespace-pre-line">
              {komentar.konten}
            </p>
            <p className="text-xs text-gray-500">
              Dibuat pada{" "}
              {new Date(komentar.created_at).toLocaleString("id-ID")}
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-semibold">Berita Terkait</p>
            <div className="rounded-lg border p-3 bg-gray-50 dark:bg-gray-900/40 dark:border-gray-800">
              <h3 className="text-lg font-semibold">{komentar.berita_judul}</h3>
              <p className="text-sm text-gray-500">
                Slug: {komentar.berita_slug}
              </p>
              {komentar.berita_excerpt && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  {komentar.berita_excerpt}
                </p>
              )}
              {komentar.berita_konten && (
                <p className="text-sm text-gray-500 mt-3 line-clamp-4">
                  {komentar.berita_konten}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
