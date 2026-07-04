// ─── AI Governance Dashboard ───
// Centralized view of all AI activity across AQLIYA products.
// Read-only dashboard — no mutations.

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAiGovernanceStatsAction } from "@/actions/ai-governance-actions";
import { getModelGovernanceStats } from "@/lib/platform/model-governance/model-governance-service";
import { AiGovernanceClient } from "./ai-governance-client";

export const metadata = {
  title: "حوكمة الذكاء الاصطناعي | AI Governance",
};

export default async function AiGovernancePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/settings/ai-governance");

  const [result, modelStats] = await Promise.all([
    getAiGovernanceStatsAction(),
    getModelGovernanceStats().catch(() => null),
  ]);

  return (
    <div className="container mx-auto py-8 px-4" dir="rtl">
      <AiGovernanceClient
        stats={result.ok && result.data ? result.data : null}
        error={!result.ok ? (result.error ?? null) : null}
        modelStats={modelStats}
      />
    </div>
  );
}
