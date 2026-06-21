/**
 * AQLIYA Intelligence Core — canonical module registry (IC-P1-01).
 *
 * Dependency rule: products → @/lib/core/* → legacy implementation modules.
 * Legacy import paths remain supported during transition.
 */
export * as Access from "./access";
export * as Audit from "./audit";
export * as Contracts from "./contracts";
export * as Evidence from "./evidence";
export * as Governance from "./governance";
export * as AI from "./ai";
export * as Knowledge from "./knowledge";
export * as Memory from "./memory";
export * as Signals from "./signals";
export * as Events from "./events";
export * as Workflow from "./workflow";

export type { CoreEngineKey } from "./registry-types";
export { CORE_ENGINE_KEYS } from "./registry-types";
