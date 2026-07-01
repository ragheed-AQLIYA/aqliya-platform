/**
 * SalesOS — Canonical public API
 * Unified entry point for all SalesOS modules
 */

// Main layer (core CRUD + services)
export * from "./services/index";
export * from "./governance";
export * from "./guards";
export {
  hasSalesPermission,
  getSalesPermissionsForRole,
  SALESOS_PERMISSIONS,
} from "./permissions";
export type { SalesPermission } from "./permissions";
export * from "./next-action-engine";

// v02 (intelligence domains)
export * from "./v02/strategic-recommendations/index";
export * from "./v02/proof-network/index";
export * from "./v02/proof-effectiveness/index";
export * from "./v02/market-intelligence/index";
export * from "./v02/institutional-learning/index";
export * from "./v02/knowledge-graph/index";
export * from "./v02/cross-product-signals/index";

// vnext (genuinely new modules)
export * from "./vnext/account-intelligence";
export * from "./vnext/commercial-evidence";
export * from "./vnext/commercial-memory";
export * from "./vnext/deal-review";
export * from "./vnext/icp-learning";
export * from "./vnext/meeting-intelligence";
export * from "./vnext/opportunity-intelligence";
export * from "./vnext/pipeline-analytics";
export * from "./vnext/proposal-workflow";
export * from "./vnext/revenue-intelligence";
export * from "./vnext/workspace-metadata";
