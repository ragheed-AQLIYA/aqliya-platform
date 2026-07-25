import { isEnabled } from "@/lib/platform/feature-flags/registry";
import { createLogger } from "@/lib/observability/logger";


const logger = createLogger({ product: "platform", action: "lib-audit-reconciliation-index" });

export function isReconciliationEnabled(): boolean {
  return isEnabled("audit.reconciliation");
}

export function isReconciliationGatesEnabled(): boolean {
  return isEnabled("audit.reconciliation-gates");
}

export {
  runReconciliationForEngagement,
  appendReconciliationValidationIssues,
  appendReconciliationApprovalGates,
} from "./reconciliation-engine";

export { syncReconciliationToReportingGraph } from "./reconciliation-graph-sync";

export type {
  ReconciliationRunResult,
  ReconciliationCheckResult,
} from "./types";

export async function maybeRunReconciliationAfterPipeline(
  engagementId: string,
): Promise<void> {
  if (!isReconciliationEnabled()) return;
  try {
    const { runReconciliationForEngagement } = await import(
      "./reconciliation-engine"
    );
    await runReconciliationForEngagement(engagementId);
  } catch (err) {
    logger.error(`[Reconciliation] pipeline hook failed for ${engagementId}`, err instanceof Error ? err : new Error(String(err)));
  }
}
