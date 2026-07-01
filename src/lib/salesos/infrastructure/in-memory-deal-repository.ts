/**
 * InMemoryDealRepository — SPEC-01a §5
 *
 * Test adapter. Implements DealRepository with in-memory storage.
 * Enforces optimistic concurrency (version-based).
 * Used for domain tests without requiring a database.
 */

import type { DealRepository, DealFilter } from "../domain/repository";
import { Deal } from "../domain/deal";
import type { DealProps } from "../domain/deal";

import { ConcurrencyError, NotFoundError } from "../domain/errors";

export class InMemoryDealRepository implements DealRepository {
  private store: Map<string, DealProps> = new Map();

  async findById(dealId: string, organizationId: string): Promise<Deal | null> {
    const props = this.store.get(dealId);
    if (!props || props.organizationId !== organizationId) return null;
    return Deal.reconstitute({ ...props });
  }

  async findMany(filter: DealFilter, organizationId: string): Promise<Deal[]> {
    let results = [...this.store.values()].filter((d) => d.organizationId === organizationId);

    if (filter.stage) results = results.filter((d) => {
      const stageName = typeof d.stage === "string" ? d.stage : (d.stage as { name: string }).name;
      return stageName === filter.stage;
    });
    if (filter.ownerId) results = results.filter((d) => d.ownerId === filter.ownerId);
    if (filter.status === "open") results = results.filter((d) => {
      const stageName = typeof d.stage === "string" ? d.stage : (d.stage as { name: string }).name;
      return stageName !== "Closed Won" && stageName !== "Closed Lost";
    });
    if (filter.status === "closed") results = results.filter((d) => {
      const stageName = typeof d.stage === "string" ? d.stage : (d.stage as { name: string }).name;
      return stageName === "Closed Won" || stageName === "Closed Lost";
    });
    if (filter.search) {
      const srch = filter.search.toLowerCase();
      results = results.filter(
        (d) => d.name.toLowerCase().includes(srch) || d.accountId.toLowerCase().includes(srch),
      );
    }
    if (filter.dateFrom) results = results.filter((d) => d.expectedCloseDate && d.expectedCloseDate >= filter.dateFrom!);
    if (filter.dateTo) results = results.filter((d) => d.expectedCloseDate && d.expectedCloseDate <= filter.dateTo!);

    results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const page = filter.page ?? 1;
    const limit = Math.min(filter.limit ?? 20, 100);
    const start = (page - 1) * limit;
    return results.slice(start, start + limit).map((d) => Deal.reconstitute({ ...d }));
  }

  async save(deal: Deal): Promise<Deal> {
    const props = deal.toJSON();
    const existing = this.store.get(deal.id);

    if (existing) {
      // Optimistic concurrency check
      if (props.version !== existing.version) {
        throw new ConcurrencyError(
          `Version mismatch: expected ${props.version}, actual ${existing.version}`,
          props.version,
          existing.version,
        );
      }
      // Increment version
      props.version = existing.version + 1;
    } else {
      // New deal — assign ID if not set
      if (!props.id) throw new Error("Deal ID must be assigned before saving");
      props.version = 1;
    }

    this.store.set(props.id, { ...props });
    return Deal.reconstitute({ ...props });
  }

  async archive(dealId: string, organizationId: string): Promise<void> {
    const existing = this.store.get(dealId);
    if (!existing || existing.organizationId !== organizationId) {
      throw new NotFoundError("Deal not found", { dealId });
    }
    existing.lifecycle = "archived";
    existing.updatedAt = new Date().toISOString();
    existing.version += 1;
    this.store.set(dealId, { ...existing });
  }

  /** Test helper: seed data directly into the store */
  async seed(deal: Deal, assignId: string): Promise<void> {
    const props = deal.toJSON();
    props.id = assignId;
    this.store.set(assignId, { ...props, id: assignId, version: props.version || 1 });
  }

  /** Test helper: clear all data */
  clear(): void {
    this.store.clear();
  }
}
