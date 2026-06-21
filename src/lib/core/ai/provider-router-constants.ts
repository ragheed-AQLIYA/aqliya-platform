import type { AIProviderId } from "@/lib/ai/types"

/** Fallback order — shared by router and CLI smoke (no server-only). */
export const PROVIDER_FALLBACK_CHAIN: AIProviderId[] = [
  "openai",
  "anthropic",
  "local",
  "cloud",
  "deterministic",
]
