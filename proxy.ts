import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isBackendRoute = nextUrl.pathname.startsWith("/backend");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin"); // Keep for backward compatibility
  const isRegisterRoute = nextUrl.pathname === "/register";
  const isLoginRoute = nextUrl.pathname === "/login";

  // Protect backend routes
  if (isBackendRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Redirect /admin to /backend/dashboard (backward compatibility)
  if (isAdminRoute) {
    return NextResponse.redirect(new URL("/backend/dashboard", nextUrl));
  }

  // Protect register route (admin only)
  if (isRegisterRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isRegisterRoute && isLoggedIn) {
    const userRole = (req.auth?.user as any)?.role;
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/backend/dashboard", nextUrl));
    }
  }

  // Redirect to backend dashboard if already logged in and trying to access login
  if (isLoginRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/backend/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/backend/:path*", "/admin/:path*", "/register", "/login"],
};
