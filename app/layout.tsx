import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Portal Berita Kabupaten Merauke",
  description: "Portal berita resmi Pemerintah Kabupaten Merauke - Informasi terkini seputar pemerintahan, pembangunan, dan kegiatan di Kabupaten Merauke, Papua Selatan",
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
    url: "https://meraukekab.go.id",
    siteName: "Portal Berita Kabupaten Merauke",
    title: "Portal Berita Kabupaten Merauke",
    description: "Portal berita resmi Pemerintah Kabupaten Merauke",
    images: [
      {
        url: "/og-image.jpg",
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
    images: ["/og-image.jpg"],
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
