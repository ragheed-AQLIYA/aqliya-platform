// ─── LocalContentOS — Pilot Readiness Dashboard (V3.5 Phase 5) ───
// Single operational readiness page: 11 dimensions, GREEN/AMBER/RED status.

import { unstable_noStore as noStore } from "next/cache";
import { requireUserContext } from "@/lib/auth";
import { getPilotReadiness } from "@/lib/local-content/pilot-readiness";
import { PilotReadinessClient } from "./pilot-readiness-client";

export const dynamic = "force-dynamic";

export default async function PilotReadinessPage() {
  noStore();

  try {
    const user = await requireUserContext();
    const report = await getPilotReadiness(user.organizationId);

    return <PilotReadinessClient report={report} />;
  } catch (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            تعذر تحميل تقرير الجاهزية
          </h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "يرجى تسجيل الدخول والمحاولة مرة أخرى"}
          </p>
        </div>
      </div>
    );
  }
}
