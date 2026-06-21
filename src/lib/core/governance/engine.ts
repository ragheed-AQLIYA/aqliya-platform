import type { GovernanceContext, GovernanceTaskType } from "@/lib/governance/runtime-types";
import {
  getGovernanceContext,
  listSupportedGovernanceTasks,
  requiresHumanApproval,
} from "@/lib/governance/retrieval-router";

export interface GovernanceEvaluateInput {
  taskType: GovernanceTaskType;
}

export interface GovernanceEvaluateResult {
  context: GovernanceContext;
  taskType: GovernanceTaskType;
  humanApprovalRequired: boolean;
}

/** Thin facade over retrieval-router — IC-P1-02 entry point. */
export const GovernanceEngine = {
  evaluate(input: GovernanceEvaluateInput): GovernanceEvaluateResult {
    const context = getGovernanceContext(input.taskType);
    return {
      context,
      taskType: input.taskType,
      humanApprovalRequired: requiresHumanApproval(input.taskType),
    };
  },

  listSupportedTasks(): GovernanceTaskType[] {
    return listSupportedGovernanceTasks();
  },
};
