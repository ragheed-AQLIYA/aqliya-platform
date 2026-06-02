"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type IntelligenceHubTab = "market" | "proof" | "memory" | "graph";

const TABS: Array<{ id: IntelligenceHubTab; labelAr: string }> = [
  { id: "market", labelAr: "السوق" },
  { id: "proof", labelAr: "الإثبات" },
  { id: "memory", labelAr: "الذاكرة" },
  { id: "graph", labelAr: "الرسم" },
];

function tabFromHash(): IntelligenceHubTab {
  if (typeof window === "undefined") return "market";
  const hash = window.location.hash.replace("#", "") as IntelligenceHubTab;
  return TABS.some((t) => t.id === hash) ? hash : "market";
}

export function IntelligenceHubTabs({
  market,
  proof,
  memory,
  graph,
}: {
  market: React.ReactNode;
  proof: React.ReactNode;
  memory: React.ReactNode;
  graph: React.ReactNode;
}) {
  const [active, setActive] = useState<IntelligenceHubTab>("market");

  useEffect(() => {
    setActive(tabFromHash());
    const onHash = () => setActive(tabFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const selectTab = useCallback((id: IntelligenceHubTab) => {
    setActive(id);
    window.history.replaceState(null, "", `#${id}`);
  }, []);

  const panels: Record<IntelligenceHubTab, React.ReactNode> = {
    market,
    proof,
    memory,
    graph,
  };

  return (
    <div className="space-y-4" dir="rtl">
      <nav
        aria-label="أقسام مركز الذكاء"
        className="sticky top-0 z-10 -mx-1 border-b border-border/60 bg-background/95 px-1 pb-0 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      >
        <div className="flex gap-1 overflow-x-auto pb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectTab(tab.id)}
              className={cn(
                "shrink-0 rounded-t-md px-4 py-2.5 text-sm font-medium transition-colors",
                active === tab.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-selected={active === tab.id}
              role="tab"
            >
              {tab.labelAr}
            </button>
          ))}
        </div>
      </nav>

      <div role="tabpanel">{panels[active]}</div>
    </div>
  );
}
