// app/login/page.tsx

import { Metadata } from "next";
import { getAppSettings } from "@/lib/models/settings.model";
import LoginForm from "./_client";

// Generate metadata untuk SEO
// IMPORTANT: Login page should NOT be indexed by search engines
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAppSettings();

  return {
    title: `Login Admin | ${settings?.nama_aplikasi || "Portal Berita"}`,
    description:
      "Halaman login administrator Portal Berita Kabupaten Merauke. Akses khusus untuk admin yang terverifikasi.",
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    // Prevent caching of login page
    other: {
      "cache-control": "no-cache, no-store, must-revalidate",
    },
  };
}

export default async function LoginPage() {
  // Fetch settings untuk logo dan nama aplikasi
  const settings = await getAppSettings();

  return <LoginForm settings={settings} />;
}
