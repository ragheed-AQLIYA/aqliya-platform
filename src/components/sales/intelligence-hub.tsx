"use client";

import { useCallback, useSyncExternalStore, type ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  INTELLIGENCE_HUB_TAB_LABELS,
  INTELLIGENCE_HUB_TABS,
  parseIntelligenceHubTab,
  type IntelligenceHubTabId,
} from "@/components/sales/intelligence-hub-tabs";

export interface IntelligenceHubProps {
  marketPanel: ReactNode;
  proofPanel: ReactNode;
  memoryPanel: ReactNode;
  graphPanel: ReactNode;
}

function subscribeHash(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

function getHashTab(): IntelligenceHubTabId {
  return parseIntelligenceHubTab(window.location.hash);
}

function getServerHashTab(): IntelligenceHubTabId {
  return "market";
}

function syncHash(tab: IntelligenceHubTabId) {
  const next = `#${tab}`;
  if (window.location.hash !== next) {
    window.history.replaceState(null, "", next);
  }
}

export function IntelligenceHub({
  marketPanel,
  proofPanel,
  memoryPanel,
  graphPanel,
}: IntelligenceHubProps) {
  const activeTab = useSyncExternalStore(
    subscribeHash,
    getHashTab,
    getServerHashTab,
  );

  const onTabChange = useCallback((value: string | number | null) => {
    if (typeof value !== "string") return;
    syncHash(parseIntelligenceHubTab(value));
  }, []);

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h1 className="text-h2 font-black">مركز الذكاء التجاري</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          سوق · إثبات · ذاكرة · رسم معرفي — تبويبات للتنقل السريع
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="gap-4">
        <div
          className={cn(
            "sticky top-0 z-20 -mx-4 border-b bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80",
            "sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none",
          )}
        >
          <TabsList className="grid h-auto w-full grid-cols-4 gap-1 p-1">
            {INTELLIGENCE_HUB_TABS.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="min-h-11 px-2 py-2 text-xs sm:text-sm"
              >
                {INTELLIGENCE_HUB_TAB_LABELS[tab]}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="market" className="mt-0">
          {marketPanel}
        </TabsContent>
        <TabsContent value="proof" className="mt-0">
          {proofPanel}
        </TabsContent>
        <TabsContent value="memory" className="mt-0">
          {memoryPanel}
        </TabsContent>
        <TabsContent value="graph" className="mt-0">
          {graphPanel}
        </TabsContent>
      </Tabs>
    </div>
  );
}
