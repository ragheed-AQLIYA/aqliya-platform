import "server-only";

import {
  evaluateWithGate,
  type EvalGateResult,
} from "@/lib/ai/eval-gate";

/** IC-P3-01 — governed AI evaluation entry under Core namespace. */
export async function runEvalGate(
  suiteId: string,
  taskType: string,
  actualOutput: string,
  organizationId?: string,
): Promise<EvalGateResult> {
  return evaluateWithGate(suiteId, taskType, actualOutput, organizationId);
}

export const AIEvalGate = {
  evaluate: runEvalGate,
};

export type { EvalGateResult };
