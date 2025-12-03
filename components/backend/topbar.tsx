"use client";

import { Bell, Search, LogOut, Eye, Menu, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminTopbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
  onMenuClick?: () => void;
}

export default function AdminTopbar({ user, onMenuClick }: AdminTopbarProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left Section - Mobile Menu + Search */}
      <div className="flex items-center gap-2 lg:gap-4 flex-1 max-w-2xl">
        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden shrink-0">
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Cari..."
            className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 w-70"
          />
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-1 lg:gap-2">
        {/* View Website Button - Hidden on mobile */}
        <Button variant="outline" size="sm" asChild className="hidden md:flex">
          <Link href="/" target="_blank">
            <Eye className="h-4 w-4 mr-2" />
            Lihat Website
          </Link>
        </Button>

        {/* Dark Mode Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Tidak ada notifikasi baru
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                {user.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-sm font-medium truncate max-w-[120px]">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500">{user.role}</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/backend/pengaturan">
                <Settings className="h-4 w-4 mr-2" />
                Pengaturan
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/" target="_blank">
                <Eye className="h-4 w-4 mr-2" />
                Lihat Website
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
