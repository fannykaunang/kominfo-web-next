// lib/metadata.ts

import { Metadata } from "next";
import React from "react";
import { getAppSettings } from "@/lib/models/settings.model";
import { AppSettings } from "@/lib/types";

/**
 * Base metadata configuration
 * This will be used as fallback for all pages
 */
export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Default metadata untuk seluruh aplikasi
 * Diambil dari app_settings
 */
let cachedSettings: AppSettings | null = null;

async function getSettings(): Promise<AppSettings | null> {
  if (!cachedSettings) {
    cachedSettings = await getAppSettings();
  }
  return cachedSettings;
}

/**
 * Generate default metadata dari settings
 */
export async function getDefaultMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  if (!settings) {
    return {
      title: "Portal Berita",
      description: "Portal berita dan informasi terkini",
    };
  }

  return {
    title: {
      default: settings.nama_aplikasi,
      template: `%s | ${settings.alias_aplikasi || settings.nama_aplikasi}`,
    },
    description: settings.meta_description || settings.deskripsi || undefined,
    keywords: settings.meta_keywords || undefined,
    authors: [{ name: settings.nama_aplikasi }],
    creator: settings.nama_aplikasi,
    publisher: settings.nama_aplikasi,
    applicationName: settings.nama_aplikasi,
    metadataBase: new URL(BASE_URL),

    openGraph: {
      type: "website",
      locale: "id_ID",
      url: BASE_URL,
      siteName: settings.nama_aplikasi,
      title: settings.nama_aplikasi,
      description: settings.meta_description || settings.deskripsi || undefined,
      images: settings.og_image
        ? [
            {
              url: settings.og_image,
              width: 1200,
              height: 630,
              alt: settings.nama_aplikasi,
            },
          ]
        : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title: settings.nama_aplikasi,
      description: settings.meta_description || settings.deskripsi || undefined,
      images: settings.og_image ? [settings.og_image] : undefined,
      creator: settings.twitter_url?.split("/").pop() || undefined,
    },

    robots: {
      index: settings.mode === "online",
      follow: settings.mode === "online",
      nocache: settings.mode === "maintenance",
      googleBot: {
        index: settings.mode === "online",
        follow: settings.mode === "online",
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    verification: {
      // Add your verification tokens here
      google: process.env.GOOGLE_SITE_VERIFICATION,
      // yandex: "yandex-verification-code",
      // bing: "bing-verification-code",
    },

    alternates: {
      canonical: BASE_URL,
    },

    icons: {
      icon: settings.favicon || "/favicon.ico",
      shortcut: settings.favicon || "/favicon.ico",
      apple: settings.favicon || "/apple-touch-icon.png",
    },

    manifest: "/manifest.json",
  };
}

/**
 * Generate metadata untuk halaman publik
 */
export interface PublicPageMetadataOptions {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  path?: string;
  publishedTime?: Date | string;
  modifiedTime?: Date | string;
  author?: string;
  type?: "website" | "article";
  noindex?: boolean;
}

export async function generatePublicMetadata(
  options: PublicPageMetadataOptions
): Promise<Metadata> {
  const settings = await getSettings();
  const baseTitle =
    settings?.alias_aplikasi || settings?.nama_aplikasi || "Portal Berita";

  const fullTitle = options.title;
  const description =
    options.description ||
    settings?.meta_description ||
    settings?.deskripsi ||
    "";
  const keywords =
    options.keywords?.join(", ") || settings?.meta_keywords || "";
  const image = options.image || settings?.og_image || "";
  const url = options.path ? `${BASE_URL}${options.path}` : BASE_URL;
  const type = options.type || "website";

  return {
    title: fullTitle + ` | ${baseTitle}`,
    description,
    keywords,

    openGraph: {
      type: type === "article" ? "article" : "website",
      locale: "id_ID",
      url,
      siteName: settings?.nama_aplikasi,
      title: fullTitle,
      description,
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: fullTitle,
            },
          ]
        : undefined,
      publishedTime: options.publishedTime
        ? new Date(options.publishedTime).toISOString()
        : undefined,
      modifiedTime: options.modifiedTime
        ? new Date(options.modifiedTime).toISOString()
        : undefined,
      authors: options.author ? [options.author] : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: image ? [image] : undefined,
      creator: settings?.twitter_url?.split("/").pop() || undefined,
    },

    alternates: {
      canonical: url,
    },

    robots: options.noindex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: settings?.mode === "online",
          follow: settings?.mode === "online",
          googleBot: {
            index: settings?.mode === "online",
            follow: settings?.mode === "online",
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

/**
 * Generate metadata untuk halaman backend/dashboard
 * Backend pages should not be indexed by search engines
 */
export interface BackendPageMetadataOptions {
  title: string;
  description?: string;
}

export async function generateBackendMetadata(
  options: BackendPageMetadataOptions
): Promise<Metadata> {
  const settings = await getSettings();
  const baseTitle = settings?.nama_aplikasi || "Dashboard";

  return {
    title: `${options.title} | Backend ${baseTitle}`,
    description: options.description || `Halaman backend ${options.title}`,

    // Backend pages should NOT be indexed
    robots: {
      index: false,
      follow: false,
      nocache: true,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
      googleBot: {
        index: false,
        follow: false,
      },
    },

    // No OpenGraph for backend
    openGraph: undefined,
    twitter: undefined,
  };
}

/**
 * Generate metadata untuk artikel/berita
 */
export interface ArticleMetadataOptions {
  title: string;
  excerpt: string;
  content?: string;
  image?: string;
  slug: string;
  publishedAt?: Date | string;
  updatedAt?: Date | string;
  author?: string;
  category?: string;
  tags?: string[];
}

export async function generateArticleMetadata(
  options: ArticleMetadataOptions
): Promise<Metadata> {
  const settings = await getSettings();

  // Generate keywords from title, category, and tags
  const keywords = [
    ...options.title.split(" ").slice(0, 5), // First 5 words from title
    options.category || "",
    ...(options.tags || []),
    settings?.nama_aplikasi || "",
  ].filter(Boolean);

  return generatePublicMetadata({
    title: options.title,
    description: options.excerpt,
    keywords,
    image: options.image,
    path: `/berita/${options.slug}`,
    publishedTime: options.publishedAt,
    modifiedTime: options.updatedAt,
    author: options.author,
    type: "article",
  });
}

/**
 * Generate metadata untuk kategori
 */
export interface CategoryMetadataOptions {
  name: string;
  description?: string;
  slug: string;
  count?: number;
}

export async function generateCategoryMetadata(
  options: CategoryMetadataOptions
): Promise<Metadata> {
  const settings = await getSettings();

  const title = options.count
    ? `${options.name} (${options.count} Berita)`
    : options.name;

  const description =
    options.description ||
    `Jelajahi ${options.count || "semua"} berita dalam kategori ${
      options.name
    } di ${settings?.nama_aplikasi || "Portal Berita"}`;

  return generatePublicMetadata({
    title: `Kategori: ${title}`,
    description,
    keywords: [
      options.name,
      "kategori",
      "berita",
      settings?.nama_aplikasi || "",
    ],
    path: `/berita/${options.slug}`,
    type: "website",
  });
}

/**
 * Generate structured data (JSON-LD) untuk artikel
 */
export function generateArticleStructuredData(
  options: ArticleMetadataOptions & {
    url: string;
    authorUrl?: string;
    publisherLogo?: string;
    publisherName: string;
  }
) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: options.title,
    description: options.excerpt,
    image: options.image ? [options.image] : undefined,
    datePublished: options.publishedAt
      ? new Date(options.publishedAt).toISOString()
      : undefined,
    dateModified: options.updatedAt
      ? new Date(options.updatedAt).toISOString()
      : undefined,
    author: options.author
      ? {
          "@type": "Person",
          name: options.author,
          url: options.authorUrl,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: options.publisherName,
      logo: options.publisherLogo
        ? {
            "@type": "ImageObject",
            url: options.publisherLogo,
          }
        : undefined,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": options.url,
    },
    articleSection: options.category,
    keywords: options.tags?.join(", "),
  };
}

/**
 * Generate structured data (JSON-LD) untuk website
 */
export async function generateWebsiteStructuredData() {
  const settings = await getSettings();

  if (!settings) return null;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.nama_aplikasi,
    alternateName: settings.alias_aplikasi,
    url: BASE_URL,
    description: settings.deskripsi,
    publisher: {
      "@type": "Organization",
      name: settings.nama_aplikasi,
      logo: settings.logo
        ? {
            "@type": "ImageObject",
            url: `${BASE_URL}${settings.logo}`,
          }
        : undefined,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate structured data (JSON-LD) untuk organization
 */
export async function generateOrganizationStructuredData() {
  const settings = await getSettings();

  if (!settings) return null;

  const socialLinks = [
    settings.facebook_url,
    settings.instagram_url,
    settings.twitter_url,
    settings.youtube_url,
    settings.tiktok_url,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.nama_aplikasi,
    alternateName: settings.alias_aplikasi,
    url: BASE_URL,
    logo: settings.logo ? `${BASE_URL}${settings.logo}` : undefined,
    description: settings.deskripsi,
    email: settings.email,
    telephone: settings.no_telepon,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.alamat,
      addressCountry: "ID",
    },
    sameAs: socialLinks,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings.no_telepon,
      contactType: "customer service",
      email: settings.email,
      availableLanguage: ["id", "Indonesian"],
    },
  };
}

/**
 * Generate structured data (JSON-LD) untuk breadcrumb
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbStructuredData(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}
/**
 * Helper untuk render structured data di page
 */
export function StructuredData({ data }: { data: any }): React.ReactElement {
  return React.createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  });
}
