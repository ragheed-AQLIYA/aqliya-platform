"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Plausible Analytics - privacy-friendly
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("pageview", { u: window.location.href });
    }
  }, [pathname]);

  return (
    <>
      {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
        <script
          defer
          data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.js"
        />
      )}
    </>
  );
}
