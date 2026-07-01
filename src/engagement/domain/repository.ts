/** Repository interface — same pattern as SalesOS */
import type { Engagement } from "./engagement";
import type { EngagementStatus } from "./engagement";

export interface EngagementFilter {
  status?: EngagementStatus; clientId?: string; period?: string;
  ownerId?: string; search?: string; page?: number; limit?: number;
}

export interface EngagementRepository {
  findById(id: string, orgId: string): Promise<Engagement | null>;
  findMany(filter: EngagementFilter, orgId: string): Promise<Engagement[]>;
  save(e: Engagement): Promise<Engagement>;
}
