export const CORE_ENGINE_KEYS = [
  "access",
  "audit",
  "contracts",
  "decision",
  "evidence",
  "governance",
  "ai",
  "knowledge",
  "memory",
  "signals",
  "policy",
  "events",
  "workflow",
] as const;

export type CoreEngineKey = (typeof CORE_ENGINE_KEYS)[number];
