import { isEnabled } from "@/lib/platform/feature-flags/registry";

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
    console.error(
      `[Reconciliation] pipeline hook failed for ${engagementId}`,
      err,
    );
  }
}
