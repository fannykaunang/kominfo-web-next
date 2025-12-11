// components/layout/header.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Search,
  Menu as MenuIcon,
  Moon,
  Sun,
  MapPin,
  ChevronDown,
  CircleUser,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types
interface Halaman {
  id: string;
  judul: string;
  slug: string;
  urutan: number;
}

interface MenuItem {
  id: string;
  nama: string;
  slug: string;
  icon: string | null;
  urutan: number;
  halaman: Halaman[];
}

interface NavItem {
  name: string;
  href: string;
  icon?: string | null; // optional, bisa null
  hasDropdown: boolean;
  halaman: Halaman[]; // untuk menu biasa: []
}

// Static nav items (always shown)
const staticNavItems: NavItem[] = [
  {
    name: "Beranda",
    href: "/",
    icon: null, // atau misalnya "Home"
    hasDropdown: false,
    halaman: [],
  },
  {
    name: "Berita",
    href: "",
    icon: null, // atau "Newspaper"
    hasDropdown: true,
    halaman: [
      {
        id: "berita-terbaru",
        judul: "Semua Berita",
        slug: "berita", // hasil URL: /berita/terbaru
        urutan: 1,
      },
      {
        id: "kategori-berita",
        judul: "Kategori Berita",
        slug: "berita/kategori", // hasil URL: /berita/kategori
        urutan: 2,
      },
    ],
  },
];

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch menu from database
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch("/api/menu/published");
        if (response.ok) {
          const data = await response.json();
          setMenuItems(data);
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // Get icon component from lucide-react
  const getIcon = (iconName: string | null) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4 mr-1.5" /> : null;
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full bg-background">
        <div className="border-b border-border/40">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between py-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Kabupaten Merauke, Papua Selatan</span>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-xl shadow-lg">
                M
              </div>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  // Combine static and dynamic nav items
  const allNavItems: NavItem[] = [
    ...staticNavItems,
    ...menuItems.map<NavItem>((menu) => {
      // Untuk menu Organisasi, tambahkan item SKPD
      if (menu.slug === "organisasi") {
        return {
          name: menu.nama,
          href: `/${menu.slug}`,
          icon: menu.icon,
          hasDropdown: true,
          halaman: [
            ...menu.halaman,
            // Tambahkan item SKPD sebagai halaman statis
            {
              id: "skpd-static",
              judul: "SKPD",
              slug: "skpd",
              urutan: 999, // Urutan terakhir
            },
          ],
        };
      }

      return {
        name: menu.nama,
        href: `/${menu.slug}`,
        icon: menu.icon,
        hasDropdown: menu.halaman.length > 0,
        halaman: menu.halaman,
      };
    }),
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-md"
          : "bg-background"
      }`}
    >
      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-xl shadow-lg">
              M
            </div>
            <div className="hidden md:block">
              <div className="font-bold text-lg leading-tight">
                Portal Berita
              </div>
              <div className="text-xs text-muted-foreground">
                Kabupaten Merauke
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {allNavItems.map((item) => {
              // If menu has sub-pages (halaman), show dropdown
              if ("hasDropdown" in item && item.hasDropdown) {
                return (
                  <DropdownMenu key={item.name}>
                    <DropdownMenuTrigger asChild>
                      <button className="px-3 py-2 rounded-md text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1">
                        {item.icon && getIcon(item.icon)}
                        {item.name}
                        <ChevronDown className="h-3 w-3 ml-0.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      {item.halaman.map((halaman) => (
                        <DropdownMenuItem key={halaman.id} asChild>
                          <Link
                            href={`${item.href}/${halaman.slug}`}
                            className="cursor-pointer"
                          >
                            {halaman.judul}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              // Regular link (no dropdown)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-3 py-2 rounded-md text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent transition-colors flex items-center"
                >
                  {"icon" in item && item.icon && getIcon(item.icon)}
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 cursor-pointer"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-6 w-6" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* User Profile */}
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label="User profile"
            >
              <Link href="/login" title="Halaman Login">
                <CircleUser className="h-5 w-5" />
              </Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 lg:hidden"
                  aria-label="Menu"
                >
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[400px] flex flex-col"
              >
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-8 overflow-y-auto max-h-[calc(100vh-160px)] pr-1">
                  {allNavItems.map((item) => (
                    <div key={item.name}>
                      <Link
                        href={item.href}
                        className="px-4 py-2 rounded-md text-base font-medium hover:bg-accent transition-colors flex items-center"
                      >
                        {"icon" in item && item.icon && getIcon(item.icon)}
                        {item.name}
                      </Link>

                      {/* Show sub-pages in mobile */}
                      {"halaman" in item && item.halaman.length > 0 && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.halaman.map((halaman) => (
                            <Link
                              key={halaman.id}
                              href={`${item.href}/${halaman.slug}`}
                              className="block px-4 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                            >
                              {halaman.judul}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
