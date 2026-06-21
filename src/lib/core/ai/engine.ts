import "server-only";

import type { AIProviderId } from "@/lib/ai/types";
import {
  isAuditAICoreEnabled,
  runGovernedAuditAI,
  type GovernedAuditAIResult,
  type RunGovernedAuditAIParams,
} from "@/lib/audit/audit-ai-bridge";
import type { GovernanceTaskType } from "@/lib/governance/runtime-types";
import {
  runGovernedOfficeAI,
  type GovernedOfficeAIInput,
  type GovernedOfficeAIResult,
} from "@/lib/office-ai/office-ai-orchestrator-bridge";
import {
  isProductAICoreEnabled,
  runGovernedProductAI,
  type GovernedProductAIInput,
  type GovernedProductAIResult,
} from "@/lib/platform/product-ai-bridge";

export type CoreAIDomain = "product" | "audit" | "office";

export type CoreAIProductRequest = GovernedProductAIInput & {
  domain: "product";
};

export type CoreAIAuditRequest = RunGovernedAuditAIParams & {
  domain: "audit";
};

export type CoreAIOfficeRequest = GovernedOfficeAIInput & {
  domain: "office";
};

export type CoreAIExecuteRequest =
  | CoreAIProductRequest
  | CoreAIAuditRequest
  | CoreAIOfficeRequest;

export type CoreAIExecuteResult =
  | { domain: "product"; result: GovernedProductAIResult | null }
  | { domain: "audit"; result: GovernedAuditAIResult }
  | { domain: "office"; result: GovernedOfficeAIResult | null };

/** Returns true when any governed AI path is feature-flag enabled. */
export function isCoreAIEnabled(): boolean {
  return isProductAICoreEnabled() || isAuditAICoreEnabled();
}

/**
 * IC-P1-03 — canonical governed AI entry for all products.
 * Routes to product / audit / office adapters; access gates remain in each path.
 */
export async function execute(
  request: CoreAIExecuteRequest,
): Promise<CoreAIExecuteResult> {
  switch (request.domain) {
    case "audit": {
      const { domain: _domain, ...params } = request;
      const result = await runGovernedAuditAI(params);
      return { domain: "audit", result };
    }
    case "office": {
      const { domain: _domain, ...params } = request;
      const result = await runGovernedOfficeAI(params);
      return { domain: "office", result };
    }
    case "product":
    default: {
      const { domain: _domain, ...input } = request;
      const result = await runGovernedProductAI(input);
      return { domain: "product", result };
    }
  }
}

/** Convenience helpers for typed call sites. */
export const AIEngine = {
  execute,
  isEnabled: isCoreAIEnabled,
  executeProduct(input: Omit<GovernedProductAIInput, never>) {
    return execute({ domain: "product", ...input });
  },
  executeAudit(params: RunGovernedAuditAIParams) {
    return execute({ domain: "audit", ...params });
  },
  executeOffice(input: GovernedOfficeAIInput) {
    return execute({ domain: "office", ...input });
  },
};

export type {
  AIProviderId,
  GovernedAuditAIResult,
  GovernedOfficeAIInput,
  GovernedOfficeAIResult,
  GovernedProductAIInput,
  GovernedProductAIResult,
  GovernanceTaskType,
  RunGovernedAuditAIParams,
};
