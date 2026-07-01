/**
 * Repository Interface — SPEC-01a §5
 *
 * Returns Aggregates only. Never DTOs or ORM models.
 * Implementation deferred to infrastructure layer.
 */

import type { Deal } from "./deal";
import type { StageName } from "./value-objects/stage";

export interface DealFilter {
  stage?: StageName;
  ownerId?: string;
  status?: "open" | "closed";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DealRepository {
  findById(dealId: string, organizationId: string): Promise<Deal | null>;
  findMany(filter: DealFilter, organizationId: string): Promise<Deal[]>;
  save(deal: Deal): Promise<Deal>;
  archive(dealId: string, organizationId: string): Promise<void>;
}
