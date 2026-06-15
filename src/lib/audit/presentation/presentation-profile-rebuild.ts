import "server-only";

import { prisma } from "@/lib/prisma";
import { isFsV2Enabled } from "@/lib/audit/fs-engine";
import type { PresentationProfileRebuildResult } from "@/lib/audit/presentation/presentation-profile-rebuild-types";

export type {
  PresentationProfileRebuildResult,
  PresentationProfileRebuildStatus,
} from "@/lib/audit/presentation/presentation-profile-rebuild-types";

/**
 * Phase 13.1.1 — rebuild FS after presentation profile/policy change.
 * Returns structured status for admin UX (auto-rebuild vs manual prompt).
 */
export async function rebuildFinancialStatementsAfterProfileChange(
  engagementId: string,
): Promise<PresentationProfileRebuildResult> {
  const mappingCount = await prisma.auditAccountMapping.count({
    where: { engagementId },
  });

  if (mappingCount === 0) {
    return { status: "skipped_no_mappings" };
  }

  try {
    const { rebuildFinancialStatementsForEngagement } = await import(
      "@/lib/audit/db/index"
    );
    await rebuildFinancialStatementsForEngagement(engagementId);
    return {
      status: "rebuilt",
      method: isFsV2Enabled() ? "v2" : "v1",
      statementCount: isFsV2Enabled() ? 4 : 3,
    };
  } catch (err) {
    return {
      status: "failed",
      errorMessage: err instanceof Error ? err.message : String(err),
    };
  }
}
