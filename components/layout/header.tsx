"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X, Search, Sun, Moon, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useTheme } from "next-themes"

const navigationItems = [
  { name: "Beranda", href: "/" },
  { name: "Berita", href: "/berita" },
  { name: "Pemerintahan", href: "/kategori/pemerintahan" },
  { name: "Pembangunan", href: "/kategori/pembangunan" },
  { name: "Pariwisata", href: "/kategori/pariwisata" },
  { name: "Tentang", href: "/tentang" },
  { name: "Kontak", href: "/kontak" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!mounted) return null

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-md"
          : "bg-background"
      }`}
    >
      {/* Top Bar */}
      <div className="border-b border-border/40">
        <div className="container flex items-center justify-between py-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Kabupaten Merauke, Papua Selatan</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground hidden sm:inline">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-xl transition-shadow">
                M
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gold-500 border-2 border-background"></div>
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
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu Navigasi</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-6">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {searchOpen && (
        <div className="border-t border-border/40 bg-muted/30 animate-fade-in">
          <div className="container py-4">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari berita..."
                className="pl-10 pr-4 h-12 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
