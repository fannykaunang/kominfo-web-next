"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isBackendRoute =
    pathname?.startsWith("/backend") || pathname?.startsWith("/admin");
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // Backend & auth routes: NO header/footer
  if (isBackendRoute || isAuthRoute) {
    return <>{children}</>;
  }

  // Public routes: WITH header/footer
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
