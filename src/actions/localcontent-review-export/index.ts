"use server";

import { getCurrentUser } from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import { gatherReviewData } from "./data";
import { computeReviewMetrics } from "./metrics";
import { generateReviewPdf } from "./pdf-builder";
import type { ReviewExportResult } from "./common";

export type { ReviewExportResult };

export async function exportReviewSummaryPdfAction(): Promise<ReviewExportResult> {
  try {
    const user = await getCurrentUser();
    await enforce(user, { type: "project" }, "export");

    const orgId = user.organizationId;
    const raw = await gatherReviewData(orgId);
    const metrics = computeReviewMetrics(raw.suggestions, raw.explanations, raw.healthRecords);

    const pdfResult = await generateReviewPdf(
      { email: user.email },
      raw.suggestions,
      raw.explanations,
      raw.healthRecords,
      raw.lastRun,
      raw.memCount,
      metrics,
    );

    return { success: true, data: pdfResult };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to generate PDF",
    };
  }
}
