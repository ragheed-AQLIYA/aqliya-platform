"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function GovernanceClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
      setLastRefresh(new Date());
    }, 30_000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div>
      <div className="mb-2 text-[11px] text-muted-foreground/60 text-left" dir="ltr">
        آخر تحديث: {lastRefresh.toLocaleString("ar-SA")}
      </div>
      {children}
    </div>
  );
}
