/**
 * SalesOS Store — Evidence & Audit domain
 */

import type { SalesEvidenceRef, SalesAuditEntry } from "./common";
import { getOrgStore, schedulePersist, persistPrismaWrite } from "./common";

// ─── Evidence ───

export function linkEvidence(
  input: Omit<SalesEvidenceRef, "id" | "linkedAt">,
): SalesEvidenceRef {
  const store = getOrgStore(input.organizationId);
  const ref: SalesEvidenceRef = {
    ...input,
    id: `sales-ev-${crypto.randomUUID().slice(0, 8)}`,
    linkedAt: new Date().toISOString(),
  };
  store.evidence.set(ref.id, ref);
  schedulePersist(input.organizationId);
  persistPrismaWrite(input.organizationId, "createEvidence", async () => {
    const { evidenceRepository } = await import("../repositories");
    await evidenceRepository.create(ref);
  });
  return ref;
}

export function listEvidenceForOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesEvidenceRef[] {
  return [...getOrgStore(organizationId).evidence.values()].filter(
    (e) => e.opportunityId === opportunityId,
  );
}

// ─── Audit ───

export function appendAuditEntry(
  entry: Omit<SalesAuditEntry, "id" | "timestamp">,
): SalesAuditEntry {
  const store = getOrgStore(entry.organizationId);
  const full: SalesAuditEntry = {
    ...entry,
    id: `sales-audit-${crypto.randomUUID().slice(0, 8)}`,
    timestamp: new Date().toISOString(),
  };
  store.auditLog.push(full);
  schedulePersist(entry.organizationId);
  return full;
}

export function listAuditEntries(organizationId: string): SalesAuditEntry[] {
  return [...getOrgStore(organizationId).auditLog].reverse();
}
