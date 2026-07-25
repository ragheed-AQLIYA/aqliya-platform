import { isEnabled } from "@/lib/platform/feature-flags/registry";
import { createLogger } from "@/lib/observability/logger";


const logger = createLogger({ product: "platform", action: "unknown" });

export function isFsV2Enabled(): boolean {
  return isEnabled("audit.fs-v2");
}

export { rebuildFinancialStatementsV2 } from "./fs-rebuild-service";
export {
  transitionFinancialStatementStatus,
  markAllFinancialStatementsReviewed,
  approveAllFinancialStatementsForEngagement,
  canTransitionFsStatus,
} from "./status-lifecycle";
export {
  buildCashFlowLinesFromContext,
  deriveCashFlowContext,
  extractCashFlowTieAmounts,
} from "./cash-flow-builder";
export type {
  FinancialStatementStatus,
  FsRebuildSummary,
  FsStatementType,
} from "./types";

/** Returns true when v2 handled the rebuild (caller skips v1 loop). */
export async function maybeRebuildFinancialStatements(
  engagementId: string,
): Promise<boolean> {
  if (!isFsV2Enabled()) return false;
  try {
    const { rebuildFinancialStatementsV2 } = await import("./fs-rebuild-service");
    await rebuildFinancialStatementsV2(engagementId);
    return true;
  } catch (err) {
    logger.error(`[FS Engine v2] rebuild failed for ${engagementId}`, err instanceof Error ? err : undefined);
    throw err;
  }
}
