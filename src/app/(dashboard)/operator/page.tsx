import "server-only";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

import { getSystemHealthAction } from "@/actions/operator-actions";
import { getQueueStatsAction } from "@/actions/operator-actions";
import { getDatabaseStatsAction } from "@/actions/operator-actions";
import { getRecentAuditEventsAction } from "@/actions/operator-actions";
import { getSystemPerformanceAction } from "@/actions/operator-actions";

import { OperatorDashboardClient } from "./operator-dashboard-client";

export const dynamic = "force-dynamic";

export default async function OperatorDashboardPage() {
  try {
    await getCurrentUser();
  } catch {
    redirect("/login");
  }

  const [health, queue, db, recentEvents, performance] = await Promise.all([
    getSystemHealthAction().catch(() => null),
    getQueueStatsAction().catch(() => null),
    getDatabaseStatsAction().catch(() => null),
    getRecentAuditEventsAction().catch(() => null),
    getSystemPerformanceAction().catch(() => null),
  ]);

  return (
    <OperatorDashboardClient
      health={health}
      queue={queue}
      db={db}
      recentEvents={recentEvents ?? []}
      performance={performance}
    />
  );
}
