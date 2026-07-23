/**
 * SalesOS Bridge Adapter
 *
 * Connects the new DDD domain (src/lib/salesos/) to existing route pages.
 * Provides drop-in wrapper functions that routes can call directly,
 * wrapping PrismaDealRepository + AuthContext creation.
 *
 * Migration path: Replace legacy `@/lib/sales/*` imports with these wrappers.
 *
 * Status: Ready for route integration. Types verified. Async event publisher omitted
 * (domain events are published best-effort; bridge works without it).
 */
import "server-only";

import { getCurrentUser } from "@/lib/auth";
import { PrismaDealRepository } from "@/lib/salesos/infrastructure/prisma-deal-repository";
import { InMemoryDomainEventPublisher } from "@/lib/salesos/infrastructure/in-memory-publisher";
import { listDealsAction, getDealAction } from "@/lib/salesos/api/actions";
import {
  createDealAction,
  updateDealAction,
  transitionDealAction,
  linkEvidenceAction,
  deleteDealAction,
} from "@/lib/salesos/api/actions-write";
import type { AuthContext } from "@/lib/salesos/api/auth-context";
import type { DealResponse, DealDetailResponse } from "@/lib/salesos/api/dto";
import type { StageName } from "@/lib/salesos/domain/value-objects/stage";
import type { ListDealsFilterInput } from "@/lib/salesos/api/actions";

// ── Repository & Publisher singletons ──
let _repo: PrismaDealRepository | null = null;
function getRepo(): PrismaDealRepository {
  if (!_repo) _repo = new PrismaDealRepository();
  return _repo;
}
const publisher = new InMemoryDomainEventPublisher();

// ── Auth context factory ──
async function buildAuthContext(): Promise<AuthContext | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return {
    user: {
      id: user.id,
      name: user.name ?? user.email ?? "unknown",
      email: user.email ?? undefined,
      role: user.role ?? "viewer",
    },
    organizationId: user.organizationId ?? "",
    platformOrganizationId: user.platformOrganizationId ?? null,
    permissions: [],
    correlationId: `sales-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  };
}

// ── Public API ──

export async function bridgeListDeals(
  filter?: ListDealsFilterInput,
): Promise<{ success: boolean; data?: DealResponse[]; error?: string }> {
  const ctx = await buildAuthContext();
  if (!ctx) return { success: false, error: "Authentication required" };
  const result = await listDealsAction(getRepo(), ctx, filter);
  if (!result.ok) return { success: false, error: result.error };
  return { success: true, data: result.data };
}

export async function bridgeGetDeal(
  dealId: string,
): Promise<{ success: boolean; data?: DealDetailResponse; error?: string }> {
  const ctx = await buildAuthContext();
  if (!ctx) return { success: false, error: "Authentication required" };
  const result = await getDealAction(getRepo(), ctx, dealId);
  if (!result.ok) return { success: false, error: result.error };
  return { success: true, data: result.data };
}

export { type StageName, type DealResponse, type DealDetailResponse };
