"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/tracking";

const pageViewEvents: Record<string, string> = {
  "/products/audit": "view_auditos",
  "/executive-brief": "view_executive_brief",
  "/contact": "view_contact_pilot_review",
  "/engagement-models": "view_engagement_models",
  "/pilot-proof": "view_pilot_proof",
  "/proof-library": "view_proof_library",
};

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const eventName = pageViewEvents[pathname];
    if (eventName) {
      trackEvent(eventName);
    }
  }, [pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const el = target.closest("[data-event]") as HTMLElement | null;
      if (el?.dataset.event) {
        trackEvent(el.dataset.event);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return <>{children}</>;
}
