"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Generate or get session ID
function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = sessionStorage.getItem("visitor_session_id");
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("visitor_session_id", sessionId);
  }
  return sessionId;
}

export function VisitorTracker() {
  const pathname = usePathname();
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    // Don't track backend routes
    if (pathname?.startsWith("/backend")) {
      return;
    }

    // Don't track API routes
    if (pathname?.startsWith("/api")) {
      return;
    }

    // Only log once per page visit
    if (hasLoggedRef.current) {
      return;
    }

    const logVisitor = async () => {
      try {
        const sessionId = getSessionId();
        const pageUrl = window.location.href;
        const referrer = document.referrer || null;

        await fetch("/api/visitor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pageUrl,
            referrer,
            sessionId,
          }),
        });

        hasLoggedRef.current = true;
      } catch (error) {
        // Silently fail - don't break user experience
        console.error("Failed to log visitor:", error);
      }
    };

    logVisitor();
  }, [pathname]);

  return null; // This component doesn't render anything
}
