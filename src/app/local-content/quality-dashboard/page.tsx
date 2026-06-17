// ─── LocalContentOS — AI Quality Dashboard ───
// Central metrics page for AI quality: acceptance rates, confidence distribution,
// pattern health, pipeline runs, and risk overview.

import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAiQualityMetricsAction } from "@/actions/localcontent-quality-actions";
import { QualityDashboardClient } from "./quality-dashboard-client";

export const dynamic = "force-dynamic";

export default async function QualityDashboardPage() {
  noStore();

  let user;
  try {
    user = await getCurrentUser();
  } catch {
    redirect("/login");
  }

  const metricsRes = await getAiQualityMetricsAction();

  if (!metricsRes.ok) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive font-medium">
          {metricsRes.error || "تعذر تحميل مقاييس الجودة"}
        </p>
      </div>
    );
  }

  return <QualityDashboardClient metrics={metricsRes.data!} />;
}
