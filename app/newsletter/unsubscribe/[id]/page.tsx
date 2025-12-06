// app/newsletter/unsubscribe/[id]/page.tsx

import {
  getNewsletterById,
  updateNewsletter,
} from "@/lib/models/newsletter.model";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Berhenti Berlangganan",
};

type UnsubscribePageProps = {
  params: Promise<{ id: string }>;
};

export default async function UnsubscribePage({
  params,
}: UnsubscribePageProps) {
  const { id } = await params;

  const subscriber = await getNewsletterById(id);

  if (!subscriber) {
    return (
      <UnsubscribeLayout
        title="Langganan tidak ditemukan"
        message="Kami tidak dapat menemukan data langganan Anda. Silakan periksa kembali tautan unsubscribe yang Anda gunakan."
        variant="error"
      />
    );
  }

  if (subscriber.is_active === 0) {
    return (
      <UnsubscribeLayout
        title="Langganan sudah dinonaktifkan"
        message="Anda sebelumnya sudah berhenti berlangganan newsletter kami."
        variant="neutral"
      />
    );
  }

  try {
    await updateNewsletter(id, {
      is_active: 0,
      unsubscribed_at: new Date(),
    });
    return (
      <UnsubscribeLayout
        title="Berhasil berhenti berlangganan"
        message="Anda tidak akan lagi menerima email newsletter dari kami."
        variant="success"
      />
    );
  } catch (error) {
    console.error("Gagal memproses unsubscribe:", error);
    return (
      <UnsubscribeLayout
        title="Terjadi kesalahan"
        message="Maaf, terjadi kendala saat memproses permintaan Anda. Silakan coba lagi nanti."
        variant="error"
      />
    );
  }
}

type UnsubscribeLayoutProps = {
  title: string;
  message: string;
  variant: "success" | "error" | "neutral";
};

function UnsubscribeLayout({
  title,
  message,
  variant,
}: UnsubscribeLayoutProps) {
  const accentColor =
    variant === "success"
      ? "#16a34a"
      : variant === "error"
      ? "#dc2626"
      : "#2563eb";

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white shadow-md rounded-xl p-8 text-center space-y-3 border border-gray-100">
        <div className="flex justify-center">
          <span
            className="inline-flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: `${accentColor}1a`, color: accentColor }}
            aria-hidden
          >
            {variant === "success" ? "✓" : variant === "error" ? "!" : "i"}
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="text-gray-600 leading-relaxed">{message}</p>
        <a
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Kembali ke beranda
        </a>
      </div>
    </main>
  );
}
