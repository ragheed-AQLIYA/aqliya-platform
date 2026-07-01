/**
 * Server Actions — SPEC-01b §2
 *
 * Read-only actions: listDeals, getDeal.
 * Every action is a translator between transport (Server Action) and Domain.
 * Zero business logic lives here.
 *
 * Write actions (create, update, transition, linkEvidence, delete)
 * will be implemented in a separate file.
 */

import "server-only";
import type { DealRepository, DealFilter } from "../domain/repository";
import type { StageName } from "../domain/value-objects/stage";
import { NotFoundError } from "../domain/errors";
import { safe, type ActionResult } from "./safe";
import type { AuthContext } from "./auth-context";
import { toDealResponse, toDealDetailResponse, type DealResponse, type DealDetailResponse } from "./dto";

// ─── Read Actions ───

export async function listDealsAction(
  repo: DealRepository,
  ctx: AuthContext,
  filter?: ListDealsFilterInput,
): Promise<ActionResult<DealResponse[]>> {
  return safe(async () => {
    const deals = await repo.findMany(
      {
        ...(filter ?? {}),
        page: filter?.page ?? 1,
        limit: Math.min(filter?.limit ?? 20, 100),
      } as DealFilter,
      ctx.organizationId,
    );
    return deals.map(toDealResponse);
  }, ctx.correlationId);
}

export async function getDealAction(
  repo: DealRepository,
  ctx: AuthContext,
  dealId: string,
): Promise<ActionResult<DealDetailResponse>> {
  return safe(async () => {
    const deal = await repo.findById(dealId, ctx.organizationId);
    if (!deal) {
      throw new NotFoundError("Deal not found", { dealId });
    }
    return toDealDetailResponse(deal);
  }, ctx.correlationId);
}

// ─── Input Types ───

export interface ListDealsFilterInput {
  stage?: StageName;
  ownerId?: string;
  status?: "open" | "closed";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}
