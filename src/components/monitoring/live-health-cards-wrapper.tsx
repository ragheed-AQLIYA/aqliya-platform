"use client";

import dynamic from "next/dynamic";

const LiveHealthCardsInner = dynamic(
  () =>
    import("@/components/monitoring/live-health-cards").then((m) => ({
      default: m.LiveHealthCards,
    })),
  { ssr: false },
);

export function LiveHealthCardsWrapper() {
  return <LiveHealthCardsInner />;
}
