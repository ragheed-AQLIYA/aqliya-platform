"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ─── Auto-refresh wrapper ──────────────────────────────────────────────────
// Refreshes the page data every 30 seconds using router.refresh(), which
// re-renders the Server Component without a full page navigation.

export function OverviewClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
      setLastRefresh(new Date());
    }, 30_000); // 30 seconds

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div>
      {/* ── Refresh timestamp ─────────────────────────────────────────── */}
      <div className="mb-2 text-[11px] text-muted-foreground/60 text-left" dir="ltr">
        آخر تحديث: {lastRefresh.toLocaleString("ar-SA")}
      </div>

      {children}
    </div>
  );
}
