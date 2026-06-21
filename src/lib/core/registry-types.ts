export const CORE_ENGINE_KEYS = [
  "access",
  "audit",
  "contracts",
  "evidence",
  "governance",
  "ai",
  "knowledge",
  "memory",
  "signals",
  "events",
  "workflow",
] as const;

export type CoreEngineKey = (typeof CORE_ENGINE_KEYS)[number];
