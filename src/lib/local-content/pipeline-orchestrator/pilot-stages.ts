// ─── Pipeline Stage 11: Pilot Readiness ───

import "server-only";

import { getPilotReadiness } from "../pilot-readiness";
import type { StageOutcome } from "./common";

export async function stagePilotReadiness(
  organizationId: string,
): Promise<StageOutcome> {
  const readiness = await getPilotReadiness(organizationId);
  const greenCount = readiness.metrics.filter((m) => m.level === "GREEN").length;
  const amberCount = readiness.metrics.filter((m) => m.level === "AMBER").length;
  const redCount = readiness.metrics.filter((m) => m.level === "RED").length;

  return {
    status: "success",
    summary: `Pilot readiness: ${readiness.overallScore}% (${readiness.overallStatus}) — ${greenCount} GREEN, ${amberCount} AMBER, ${redCount} RED`,
    details: {
      overallScore: readiness.overallScore,
      overallStatus: readiness.overallStatus,
      greenCount,
      amberCount,
      redCount,
      metrics: readiness.metrics.map((m) => ({
        label: m.label,
        level: m.level,
        score: m.score,
      })),
    },
  };
}
