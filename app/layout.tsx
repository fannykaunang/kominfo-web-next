//app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ConditionalLayout } from "@/components/conditional-layout";
import { VisitorTracker } from "@/components/visitor-tracker";

export const metadata: Metadata = {
  title: "Portal Berita Kabupaten Merauke",
  description:
    "Portal berita resmi Pemerintah Kabupaten Merauke - Informasi terkini seputar pemerintahan, pembangunan, dan kegiatan di Kabupaten Merauke, Papua Selatan",
  keywords: [
    "Merauke",
    "Papua Selatan",
    "Pemerintah Daerah",
    "Berita Merauke",
    "Kabupaten Merauke",
    "Portal Berita",
  ],
  authors: [{ name: "Pemerintah Kabupaten Merauke" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://merauke.go.id",
    siteName: "Portal Berita Kabupaten Merauke",
    title: "Portal Berita Kabupaten Merauke",
    description: "Portal berita resmi Pemerintah Kabupaten Merauke",
    images: [
      {
        url: "/images/og-default.png",
        width: 1200,
        height: 630,
        alt: "Portal Berita Kabupaten Merauke",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portal Berita Kabupaten Merauke",
    description: "Portal berita resmi Pemerintah Kabupaten Merauke",
    images: ["/images/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 dark:text-gray-100 dark:bg-gray-900 dark:text-gray-100`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <VisitorTracker />
          <div className="flex min-h-screen flex-col">
            <ConditionalLayout>{children}</ConditionalLayout>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
