import "server-only"
import type { AIProviderId } from "./types"

export interface ProviderRoutingDecision {
  selected: AIProviderId
  reason: string
}

export async function selectOptimalProvider(
  _taskType: string,
  preferred?: AIProviderId,
): Promise<ProviderRoutingDecision> {
  return {
    selected: preferred ?? "deterministic",
    reason: "default_routing",
  }
}
