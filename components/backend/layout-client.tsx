"use client";

import { createContext, useContext, useState } from "react";
import AdminSidebar from "@/components/backend/sidebar";
import AdminTopbar from "@/components/backend/topbar";
import { Toaster } from "@/components/ui/sonner";

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error(
      "useSidebarContext must be used within BackendLayoutClient"
    );
  return context;
};

interface BackendLayoutClientProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
    image?: string | null;
  };
}

export function BackendLayoutClient({
  children,
  user,
}: BackendLayoutClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Toaster richColors closeButton />
        <div className="flex">
          {/* Sidebar */}
          <AdminSidebar user={user} isOpen={isOpen} setIsOpen={setIsOpen} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Navigation Bar */}
            <AdminTopbar user={user} onMenuClick={toggle} />

            {/* Page Content */}
            <main className="flex-1 p-4 lg:p-6">{children}</main>

            {/* Backend Footer */}
            <footer className="border-t border-gray-200 dark:border-gray-700 py-4 px-4 lg:px-6">
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} Portal Berita Kabupaten Merauke.
                All rights reserved.
              </div>
            </footer>
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
