// import { auth } from "@/lib/auth";
// import { NextResponse } from "next/server";

// export default auth((req) => {
//   const { nextUrl } = req;
//   const isLoggedIn = !!req.auth;

//   const isBackendRoute = nextUrl.pathname.startsWith("/backend");
//   const isAdminRoute = nextUrl.pathname.startsWith("/admin"); // Keep for backward compatibility
//   const isRegisterRoute = nextUrl.pathname === "/register";
//   const isLoginRoute = nextUrl.pathname === "/login";

//   // Protect backend routes
//   if (isBackendRoute && !isLoggedIn) {
//     return NextResponse.redirect(new URL("/login", nextUrl));
//   }

//   // Redirect /admin to /backend/dashboard (backward compatibility)
//   if (isAdminRoute) {
//     return NextResponse.redirect(new URL("/backend/dashboard", nextUrl));
//   }

//   // Protect register route (admin only)
//   if (isRegisterRoute && !isLoggedIn) {
//     return NextResponse.redirect(new URL("/login", nextUrl));
//   }

//   if (isRegisterRoute && isLoggedIn) {
//     const userRole = (req.auth?.user as any)?.role;
//     if (userRole !== "ADMIN") {
//       return NextResponse.redirect(new URL("/backend/dashboard", nextUrl));
//     }
//   }

//   // Redirect to backend dashboard if already logged in and trying to access login
//   if (isLoginRoute && isLoggedIn) {
//     return NextResponse.redirect(new URL("/backend/dashboard", nextUrl));
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: ["/backend/:path*", "/admin/:path*", "/register", "/login"],
// };

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isSessionRevoked, hashToken } from "@/lib/models/session.model";

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isBackendRoute = nextUrl.pathname.startsWith("/backend");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin"); // Keep for backward compatibility
  const isRegisterRoute = nextUrl.pathname === "/register";
  const isLoginRoute = nextUrl.pathname === "/login";

  // Check if session is revoked (for backend routes)
  if (isBackendRoute && isLoggedIn) {
    try {
      // Get JWT token from cookie
      const cookieName =
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token";

      const token = req.cookies.get(cookieName)?.value;

      if (token) {
        const tokenHash = hashToken(token);
        const revoked = await isSessionRevoked(tokenHash);

        if (revoked) {
          // Session has been revoked, force logout
          const response = NextResponse.redirect(
            new URL("/login?reason=session_revoked", nextUrl)
          );

          // Clear the session cookie
          response.cookies.delete(cookieName);

          return response;
        }
      }
    } catch (error) {
      console.error("Error checking revoked session:", error);
      // Continue if check fails (don't block legitimate users)
    }
  }

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
