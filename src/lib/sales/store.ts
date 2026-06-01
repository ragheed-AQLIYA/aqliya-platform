// ─── SalesOS in-memory store (no schema migration) ───
// Tenant-scoped. Resets on cold start; suitable for L4 prototype until schema approved.

import type {
  SalesAccount,
  SalesContact,
  SalesLead,
  SalesOpportunity,
  SalesInteractionLog,
  SalesObjection,
  SalesProofAsset,
} from "./types";
import { buildSalesSeedData } from "./seed-data";

export interface SalesEvidenceRef {
  id: string;
  organizationId: string;
  opportunityId: string;
  typeId: string;
  label: string;
  linkedAt: string;
  linkedById: string;
}

export interface SalesAuditEntry {
  id: string;
  organizationId: string;
  action: string;
  actorId: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface OrgStore {
  accounts: Map<string, SalesAccount>;
  contacts: Map<string, SalesContact>;
  leads: Map<string, SalesLead>;
  opportunities: Map<string, SalesOpportunity>;
  interactions: Map<string, SalesInteractionLog>;
  evidence: Map<string, SalesEvidenceRef>;
  auditLog: SalesAuditEntry[];
  seeded: boolean;
}

const orgStores = new Map<string, OrgStore>();

function getOrgStore(organizationId: string): OrgStore {
  let store = orgStores.get(organizationId);
  if (!store) {
    store = {
      accounts: new Map(),
      contacts: new Map(),
      leads: new Map(),
      opportunities: new Map(),
      interactions: new Map(),
      evidence: new Map(),
      auditLog: [],
      seeded: false,
    };
    orgStores.set(organizationId, store);
  }
  return store;
}

export function ensureSalesSeed(
  organizationId: string,
  ownerId: string,
): void {
  const store = getOrgStore(organizationId);
  if (store.seeded) return;
  const seed = buildSalesSeedData(organizationId, ownerId);
  for (const a of seed.accounts) store.accounts.set(a.id, a);
  for (const c of seed.contacts) store.contacts.set(c.id, c);
  for (const o of seed.opportunities) store.opportunities.set(o.id, o);
  for (const i of seed.interactions) store.interactions.set(i.id, i);
  store.seeded = true;
}

export function listAccounts(organizationId: string): SalesAccount[] {
  return [...getOrgStore(organizationId).accounts.values()];
}

export function getAccount(
  organizationId: string,
  accountId: string,
): SalesAccount | undefined {
  const acct = getOrgStore(organizationId).accounts.get(accountId);
  return acct?.organizationId === organizationId ? acct : undefined;
}

export function createAccount(
  input: Omit<SalesAccount, "id" | "createdAt" | "updatedAt">,
): SalesAccount {
  const store = getOrgStore(input.organizationId);
  const now = new Date().toISOString();
  const account: SalesAccount = {
    ...input,
    id: `sales-acct-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: now,
    updatedAt: now,
  };
  store.accounts.set(account.id, account);
  return account;
}

export function listContactsForAccount(
  organizationId: string,
  accountId: string,
): SalesContact[] {
  return [...getOrgStore(organizationId).contacts.values()].filter(
    (c) => c.accountId === accountId,
  );
}

export function listOpportunities(organizationId: string): SalesOpportunity[] {
  return [...getOrgStore(organizationId).opportunities.values()];
}

export function listOpportunitiesForAccount(
  organizationId: string,
  accountId: string,
): SalesOpportunity[] {
  return listOpportunities(organizationId).filter(
    (o) => o.accountId === accountId,
  );
}

export function getOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesOpportunity | undefined {
  const opp = getOrgStore(organizationId).opportunities.get(opportunityId);
  return opp?.organizationId === organizationId ? opp : undefined;
}

export function updateOpportunity(
  organizationId: string,
  opportunityId: string,
  patch: Partial<SalesOpportunity>,
): SalesOpportunity | undefined {
  const store = getOrgStore(organizationId);
  const existing = store.opportunities.get(opportunityId);
  if (!existing || existing.organizationId !== organizationId) return undefined;
  const updated = { ...existing, ...patch };
  store.opportunities.set(opportunityId, updated);
  return updated;
}

export function listInteractionsForOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesInteractionLog[] {
  return [...getOrgStore(organizationId).interactions.values()].filter(
    (i) => i.opportunityId === opportunityId,
  );
}

export function linkEvidence(input: Omit<SalesEvidenceRef, "id" | "linkedAt">): SalesEvidenceRef {
  const store = getOrgStore(input.organizationId);
  const ref: SalesEvidenceRef = {
    ...input,
    id: `sales-ev-${crypto.randomUUID().slice(0, 8)}`,
    linkedAt: new Date().toISOString(),
  };
  store.evidence.set(ref.id, ref);
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

export function appendAuditEntry(entry: Omit<SalesAuditEntry, "id" | "timestamp">): SalesAuditEntry {
  const store = getOrgStore(entry.organizationId);
  const full: SalesAuditEntry = {
    ...entry,
    id: `sales-audit-${crypto.randomUUID().slice(0, 8)}`,
    timestamp: new Date().toISOString(),
  };
  store.auditLog.push(full);
  return full;
}

export function listAuditEntries(organizationId: string): SalesAuditEntry[] {
  return [...getOrgStore(organizationId).auditLog].reverse();
}

/** Ephemeral proof/objection layers — empty until OrgStore intelligence seed extended. */
export function listObjections(_organizationId: string): SalesObjection[] {
  return [];
}

export function listProofAssets(_organizationId: string): SalesProofAsset[] {
  return [];
}

export function getProofAsset(
  _organizationId: string,
  _proofAssetId: string,
): SalesProofAsset | undefined {
  return undefined;
}

export function updateProofAsset(
  _organizationId: string,
  _proofAssetId: string,
  _patch: Partial<SalesProofAsset>,
): SalesProofAsset | undefined {
  return undefined;
}
