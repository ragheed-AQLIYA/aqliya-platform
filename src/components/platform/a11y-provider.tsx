"use client";

import { useEffect } from "react";

export function A11yProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Handle reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (prefersReducedMotion.matches) {
      document.documentElement.classList.add("reduce-motion");
    }
    prefersReducedMotion.addEventListener("change", (e) => {
      document.documentElement.classList.toggle("reduce-motion", e.matches);
    });
  }, []);

  return <>{children}</>;
}
