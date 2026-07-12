import "server-only";

import type { AIProviderId } from "@/lib/core/ai/types";
import type { GovernanceTaskType } from "@/lib/governance/runtime-types";
import {
  isProductAICoreEnabled,
  runGovernedProductAI,
  type GovernedProductAIInput,
  type GovernedProductAIResult,
} from "@/lib/platform/product-ai-bridge";

// ─── Product bridge registrations (ADR-003 compliant) ───
// Products register their bridges lazily. Core does NOT statically import
// from product directories. Registration happens in app bootstrap.

type AuditBridge = {
  isEnabled: () => boolean;
  execute: (params: RunGovernedAuditAIParams) => Promise<GovernedAuditAIResult>;
};

type OfficeBridge = {
  execute: (input: GovernedOfficeAIInput) => Promise<GovernedOfficeAIResult | null>;
};

let auditBridge: AuditBridge | null = null;
let officeBridge: OfficeBridge | null = null;

/** Register the AuditOS AI bridge. Called at app startup. */
export function registerAuditBridge(bridge: AuditBridge): void {
  auditBridge = bridge;
}

/** Register the Office AI bridge. Called at app startup. */
export function registerOfficeBridge(bridge: OfficeBridge): void {
  officeBridge = bridge;
}

async function getAuditBridge(): Promise<AuditBridge> {
  if (auditBridge) return auditBridge;
  // Lazy fallback — imports product module only when first used
  const mod = await import("@/lib/audit/audit-ai-bridge");
  return {
    isEnabled: mod.isAuditAICoreEnabled,
    execute: mod.runGovernedAuditAI,
  };
}

async function getOfficeBridge(): Promise<OfficeBridge> {
  if (officeBridge) return officeBridge;
  const mod = await import("@/lib/office-ai/office-ai-orchestrator-bridge");
  return {
    execute: mod.runGovernedOfficeAI,
  };
}

// ─── Types (re-exported for convenience) ───

import type {
  GovernedAuditAIResult,
  RunGovernedAuditAIParams,
} from "@/lib/audit/audit-ai-bridge";
import type {
  GovernedOfficeAIInput,
  GovernedOfficeAIResult,
} from "@/lib/office-ai/office-ai-orchestrator-bridge";

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
export async function isCoreAIEnabled(): Promise<boolean> {
  const audit = await getAuditBridge();
  return isProductAICoreEnabled() || audit.isEnabled();
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
      const bridge = await getAuditBridge();
      const result = await bridge.execute(params);
      return { domain: "audit", result };
    }
    case "office": {
      const { domain: _domain, ...params } = request;
      const bridge = await getOfficeBridge();
      const result = await bridge.execute(params);
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
