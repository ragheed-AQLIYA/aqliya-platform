// ─── LocalContentOS publishing governance ───

import { canExportOutput } from "@/lib/platform/output/engine";
import { LOCALCONTENT_PRODUCT_KEY } from "../core-adoption";

export interface LCPublishingGateInput {
  projectStatus: string;
  approvalStatus: string;
  compliancePct: number;
  evidenceVerifiedPct: number;
  outputTypeId?: string;
}

export interface LCPublishingGateResult {
  canPublish: boolean;
  canExport: boolean;
  blockers: string[];
  disclaimerAr: string;
  disclaimerEn: string;
}

export function buildPublishingGate(input: {
  approvalStatus: string;
  evidenceCompletePct: number;
  reviewComplete: boolean;
}): { allowed: boolean; blockers: string[] } {
  const blockers: string[] = [];
  if (input.approvalStatus !== "Approved") {
    blockers.push("Project not approved");
  }
  if (input.evidenceCompletePct < 70) {
    blockers.push("Evidence verification below 70%");
  }
  if (!input.reviewComplete) {
    blockers.push("Review not complete");
  }
  return { allowed: blockers.length === 0, blockers };
}

export function evaluatePublishingGate(
  input: LCPublishingGateInput,
): LCPublishingGateResult {
  const blockers: string[] = [];
  const outputTypeId = input.outputTypeId ?? "lc_score_pdf";

  if (input.approvalStatus !== "Approved") {
    blockers.push("Project not approved");
  }
  if (input.compliancePct < 80) {
    blockers.push("Compliance checklist below 80%");
  }
  if (input.evidenceVerifiedPct < 70) {
    blockers.push("Evidence verification below 70%");
  }

  const canExport =
    blockers.length === 0 &&
    canExportOutput(LOCALCONTENT_PRODUCT_KEY, outputTypeId, input.approvalStatus);

  return {
    canPublish: blockers.length === 0 && input.projectStatus === "ReportReady",
    canExport,
    blockers,
    disclaimerAr:
      "تقرير داخلي للمراجعة — ليس تقديماً تنظيمياً. يتطلب اعتماداً بشرياً.",
    disclaimerEn:
      "Internal review report — not a regulator submission. Human approval required.",
  };
}
