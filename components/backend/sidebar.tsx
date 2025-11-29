"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Tags,
  MessageSquare,
  Users,
  Settings,
  Image,
  BarChart3,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
    image?: string | null;
  };
}

const menuItems = [
  {
    title: "Dashboard",
    href: "/backend/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Berita",
    href: "/backend/berita",
    icon: FileText,
  },
  {
    title: "Kategori",
    href: "/backend/kategori",
    icon: FolderOpen,
  },
  {
    title: "Tags",
    href: "/backend/tags",
    icon: Tags,
  },
  {
    title: "Komentar",
    href: "/backend/komentar",
    icon: MessageSquare,
  },
  {
    title: "Galeri",
    href: "/backend/galeri",
    icon: Image,
  },
  {
    title: "Statistik",
    href: "/backend/statistik",
    icon: BarChart3,
  },
  {
    title: "Users",
    href: "/backend/users",
    icon: Users,
    adminOnly: true,
  },
  {
    title: "Pengaturan",
    href: "/backend/pengaturan",
    icon: Settings,
  },
];

export default function AdminSidebar({
  user,
  isOpen: externalIsOpen,
  setIsOpen: externalSetIsOpen,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      // Auto close on mobile
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar when clicking menu item on mobile
  const handleMenuClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-50 transition-all duration-300",
          isOpen ? "w-64" : "w-0 lg:w-20",
          isMobile && !isOpen && "-translate-x-full"
        )}>
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Link href="/backend/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
              M
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 dark:text-white text-sm truncate">
                  Portal Merauke
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Admin Panel
                </div>
              </div>
            )}
          </Link>

          {/* Close button (mobile only) */}
          {isMobile && isOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="lg:hidden">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              // Hide admin-only items for non-admins
              if (item.adminOnly && user.role !== "ADMIN") {
                return null;
              }

              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleMenuClick}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  )}
                  title={!isOpen ? item.title : undefined}>
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isOpen && <span>{item.title}</span>}

                  {/* Tooltip for collapsed state */}
                  {!isOpen && (
                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                      {item.title}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        {isOpen && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {user.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {user.name || "Admin User"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.role || "USER"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button (Desktop) */}
        {!isMobile && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="absolute -right-3 top-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors hidden lg:block">
            {isOpen ? (
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        )}
      </aside>

      {/* Spacer for content (prevents content from going under sidebar) */}
      <div
        className={cn(
          "transition-all duration-300 hidden lg:block",
          isOpen ? "w-64" : "w-20"
        )}
      />
    </>
  );
}

// Export state hook for parent components
export function useSidebarState() {
  const [isOpen, setIsOpen] = useState(true);
  return { isOpen, setIsOpen };
}
