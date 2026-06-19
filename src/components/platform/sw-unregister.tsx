"use client";

import { useEffect } from "react";

/** Remove legacy service workers (disabled per CSP worker-src 'none' / R-01). */
export function SwUnregister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        void registration.unregister();
      });
    });
  }, []);

  return null;
}
