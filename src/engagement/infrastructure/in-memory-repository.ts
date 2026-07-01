/** InMemory — same concurrency pattern as SalesOS */
import type { EngagementRepository, EngagementFilter } from "../domain/repository";
import { Engagement } from "../domain/engagement";
import type { EngagementProps } from "../domain/engagement";
import { ConcurrencyError } from "../domain/errors";

export class InMemoryEngagementRepository implements EngagementRepository {
  private store = new Map<string, EngagementProps>();

  async findById(id: string, orgId: string): Promise<Engagement | null> {
    const p = this.store.get(id); if (!p || p.organizationId !== orgId) return null;
    return Engagement.reconstitute({ ...p });
  }

  async findMany(filter: EngagementFilter, orgId: string): Promise<Engagement[]> {
    let r = [...this.store.values()].filter((e) => e.organizationId === orgId);
    if (filter.status) r = r.filter((e) => e.status === filter.status);
    if (filter.clientId) r = r.filter((e) => e.clientId === filter.clientId);
    if (filter.search) r = r.filter((e) => e.clientId.toLowerCase().includes(filter.search!.toLowerCase()));
    const page = filter.page ?? 1; const limit = Math.min(filter.limit ?? 20, 100);
    return r.slice((page - 1) * limit, (page - 1) * limit + limit).map((p) => Engagement.reconstitute({ ...p }));
  }

  async save(e: Engagement): Promise<Engagement> {
    const p = e.toJSON(); const existing = this.store.get(e.id);
    if (existing) {
      if (p.version !== existing.version) throw new ConcurrencyError("Version mismatch", p.version, existing.version);
      p.version = existing.version + 1;
    } else { if (!p.id) throw new Error("ID required"); p.version = 1; }
    this.store.set(p.id, { ...p }); return Engagement.reconstitute({ ...p });
  }
}
