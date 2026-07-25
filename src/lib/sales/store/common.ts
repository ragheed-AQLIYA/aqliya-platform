/**
 * SalesOS Store — shared infrastructure
 *
 * In-memory org stores, persistence wiring, generic CRUD helpers,
 * and seed logic used by all domain modules.
 */

import type {
  SalesAccount,
  SalesActivity,
  SalesCompetitorMention,
  SalesContact,
  SalesICPInsight,
  SalesLead,
  SalesMeeting,
  SalesNextAction,
  SalesObjection,
  SalesOpportunity,
  SalesOutreach,
  SalesProofAsset,
  SalesSignal,
  SalesInteractionLog,
  SalesWinLossInsight,
} from "../types";
import { interactionToActivity } from "../types";
import { governedDefaults, salesEntityId } from "../entity-factory";
import { buildSalesSeedData } from "../seed-data";
import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ product: "salesos", action: "store-common" });

// ─── Types ───

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

export interface OrgStore {
  accounts: Map<string, SalesAccount>;
  contacts: Map<string, SalesContact>;
  leads: Map<string, SalesLead>;
  opportunities: Map<string, SalesOpportunity>;
  interactions: Map<string, SalesInteractionLog>;
  activities: Map<string, SalesActivity>;
  meetings: Map<string, SalesMeeting>;
  outreach: Map<string, SalesOutreach>;
  signals: Map<string, SalesSignal>;
  objections: Map<string, SalesObjection>;
  competitorMentions: Map<string, SalesCompetitorMention>;
  proofAssets: Map<string, SalesProofAsset>;
  icpInsights: Map<string, SalesICPInsight>;
  nextActions: Map<string, SalesNextAction>;
  winLossInsights: Map<string, SalesWinLossInsight>;
  evidence: Map<string, SalesEvidenceRef>;
  auditLog: SalesAuditEntry[];
  seeded: boolean;
}

// ─── State ───

export const orgStores = new Map<string, OrgStore>();
export const loadPromises = new Map<string, Promise<void>>();

export const FILE_PERSISTENCE_ENABLED =
  process.env.SALESOS_FILE_PERSISTENCE === "1" ||
  process.env.SALESOS_FILE_PERSISTENCE === "true";

export const PRISMA_PERSISTENCE_ENABLED =
  process.env.SALESOS_PRISMA_PERSISTENCE === "1" ||
  process.env.SALESOS_PRISMA_PERSISTENCE === "true";

/** Tier A intelligence file snapshot when Prisma has no Tier A tables yet (Agent 2). */
export const TIER_A_FILE_SNAPSHOT_ENABLED =
  FILE_PERSISTENCE_ENABLED || PRISMA_PERSISTENCE_ENABLED;

// ─── Internal helpers ───

export function emptyIntelligenceMaps(): Pick<
  OrgStore,
  | "activities"
  | "meetings"
  | "outreach"
  | "signals"
  | "objections"
  | "competitorMentions"
  | "proofAssets"
  | "icpInsights"
  | "nextActions"
  | "winLossInsights"
> {
  return {
    activities: new Map(),
    meetings: new Map(),
    outreach: new Map(),
    signals: new Map(),
    objections: new Map(),
    competitorMentions: new Map(),
    proofAssets: new Map(),
    icpInsights: new Map(),
    nextActions: new Map(),
    winLossInsights: new Map(),
  };
}

export function hydrateIntelligenceFromSeed(
  store: OrgStore,
  seed: ReturnType<typeof buildSalesSeedData>,
): void {
  for (const a of seed.activities ?? []) store.activities.set(a.id, a);
  for (const m of seed.meetings ?? []) store.meetings.set(m.id, m);
  for (const o of seed.outreach ?? []) store.outreach.set(o.id, o);
  for (const s of seed.signals ?? []) store.signals.set(s.id, s);
  for (const obj of seed.objections ?? []) store.objections.set(obj.id, obj);
  for (const c of seed.competitorMentions ?? [])
    store.competitorMentions.set(c.id, c);
  for (const p of seed.proofAssets ?? []) store.proofAssets.set(p.id, p);
  for (const i of seed.icpInsights ?? []) store.icpInsights.set(i.id, i);
  for (const n of seed.nextActions ?? []) store.nextActions.set(n.id, n);
  for (const w of seed.winLossInsights ?? [])
    store.winLossInsights.set(w.id, w);
}

export async function hydrateTierAFromPersistence(
  organizationId: string,
  store: OrgStore,
): Promise<void> {
  const { hydrateTierAIntelligenceMaps } = await import("../tier-a-persistence");
  await hydrateTierAIntelligenceMaps(organizationId, store);
}

export async function ensureOrgLoaded(organizationId: string): Promise<void> {
  if (orgStores.has(organizationId)) return;
  if (!FILE_PERSISTENCE_ENABLED && !PRISMA_PERSISTENCE_ENABLED) return;

  let pending = loadPromises.get(organizationId);
  if (!pending) {
    pending = (async () => {
      if (PRISMA_PERSISTENCE_ENABLED) {
        const {
          accountRepository,
          contactRepository,
          opportunityRepository,
          interactionRepository,
          evidenceRepository,
        } = await import("../repositories");
        const [accounts, contacts, opportunities, interactions, evidence] =
          await Promise.all([
            accountRepository.findByOrganization(organizationId),
            contactRepository.findByOrganization(organizationId),
            opportunityRepository.findByOrganization(organizationId),
            interactionRepository.findByOrganization(organizationId),
            evidenceRepository.findByOrganization(organizationId),
          ]);
        const store: OrgStore = {
          accounts: new Map(accounts.map((a) => [a.id, a])),
          contacts: new Map(contacts.map((c) => [c.id, c])),
          leads: new Map(),
          opportunities: new Map(opportunities.map((o) => [o.id, o])),
          interactions: new Map(interactions.map((i) => [i.id, i])),
          ...emptyIntelligenceMaps(),
          evidence: new Map(evidence.map((e) => [e.id, e])),
          auditLog: [],
          seeded: accounts.length > 0,
        };
        await hydrateTierAFromPersistence(organizationId, store);
        orgStores.set(organizationId, store);
        return;
      }

      if (FILE_PERSISTENCE_ENABLED) {
        const { loadSalesOrgSnapshot, hydrateOrgMaps } =
          await import("../persistence");
        const snapshot = await loadSalesOrgSnapshot(organizationId);
        if (snapshot) {
          const hydrated = hydrateOrgMaps(snapshot);
          orgStores.set(organizationId, {
            accounts: hydrated.accounts,
            contacts: hydrated.contacts,
            leads: hydrated.leads,
            opportunities: hydrated.opportunities,
            interactions: hydrated.interactions,
            activities: hydrated.activities ?? new Map(),
            meetings: hydrated.meetings ?? new Map(),
            outreach: hydrated.outreach ?? new Map(),
            signals: hydrated.signals ?? new Map(),
            objections: hydrated.objections ?? new Map(),
            competitorMentions: hydrated.competitorMentions ?? new Map(),
            proofAssets: hydrated.proofAssets ?? new Map(),
            icpInsights: hydrated.icpInsights ?? new Map(),
            nextActions: hydrated.nextActions ?? new Map(),
            winLossInsights: hydrated.winLossInsights ?? new Map(),
            evidence: hydrated.evidence,
            auditLog: hydrated.auditLog,
            seeded: hydrated.seeded,
          });
        }
      }
    })();
    loadPromises.set(organizationId, pending);
  }
  await pending;
}

export function persistPrismaWrite(
  organizationId: string,
  label: string,
  write: () => Promise<void>,
): void {
  if (!PRISMA_PERSISTENCE_ENABLED) return;
  void write().catch((error) => {
    logger.error(`[SalesOS Prisma] ${label} failed for org ${organizationId}:`, error instanceof Error ? error : new Error(String(error)));
  });
}

export function schedulePersist(organizationId: string): void {
  if (!TIER_A_FILE_SNAPSHOT_ENABLED) return;
  const store = orgStores.get(organizationId);
  if (!store) return;

  if (TIER_A_FILE_SNAPSHOT_ENABLED) {
    void (async () => {
      const { saveSalesOrgSnapshot, snapshotFromMaps } =
        await import("../persistence");
      await saveSalesOrgSnapshot(
        organizationId,
        snapshotFromMaps({
          accounts: store.accounts,
          contacts: store.contacts,
          leads: store.leads,
          opportunities: store.opportunities,
          interactions: store.interactions,
          evidence: store.evidence,
          auditLog: store.auditLog,
          seeded: store.seeded,
          activities: store.activities,
          meetings: store.meetings,
          outreach: store.outreach,
          signals: store.signals,
          objections: store.objections,
          competitorMentions: store.competitorMentions,
          proofAssets: store.proofAssets,
          icpInsights: store.icpInsights,
          nextActions: store.nextActions,
          winLossInsights: store.winLossInsights,
        }),
      );
    })();
  }
}

export function getOrgStore(organizationId: string): OrgStore {
  let store = orgStores.get(organizationId);
  if (!store) {
    store = {
      accounts: new Map(),
      contacts: new Map(),
      leads: new Map(),
      opportunities: new Map(),
      interactions: new Map(),
      ...emptyIntelligenceMaps(),
      evidence: new Map(),
      auditLog: [],
      seeded: false,
    };
    orgStores.set(organizationId, store);
  }
  return store;
}

// ─── Exported seed/test helpers ───

/** Test helper — clears in-memory org stores. */
export function resetSalesStoreForTests(): void {
  orgStores.clear();
  loadPromises.clear();
}

export async function ensureSalesSeed(
  organizationId: string,
  ownerId: string,
): Promise<void> {
  await ensureOrgLoaded(organizationId);

  if (PRISMA_PERSISTENCE_ENABLED) {
    const {
      accountRepository,
      contactRepository,
      opportunityRepository,
      interactionRepository,
      evidenceRepository,
    } = await import("../repositories");
    const seed = buildSalesSeedData(organizationId, ownerId);
    for (const a of seed.accounts) {
      await accountRepository.create(a).catch(() => {});
    }
    for (const c of seed.contacts) {
      await contactRepository.create(c).catch(() => {});
    }
    for (const o of seed.opportunities) {
      await opportunityRepository.create(o).catch(() => {});
    }
    for (const i of seed.interactions) {
      await interactionRepository.create(i).catch(() => {});
    }
    const [accounts, contacts, opportunities, interactions, evidence] =
      await Promise.all([
        accountRepository.findByOrganization(organizationId),
        contactRepository.findByOrganization(organizationId),
        opportunityRepository.findByOrganization(organizationId),
        interactionRepository.findByOrganization(organizationId),
        evidenceRepository.findByOrganization(organizationId),
      ]);
    const store: OrgStore = {
      accounts: new Map(accounts.map((a) => [a.id, a])),
      contacts: new Map(contacts.map((c) => [c.id, c])),
      leads: new Map(),
      opportunities: new Map(opportunities.map((o) => [o.id, o])),
      interactions: new Map(interactions.map((i) => [i.id, i])),
      ...emptyIntelligenceMaps(),
      evidence: new Map(evidence.map((e) => [e.id, e])),
      auditLog: [],
      seeded: true,
    };
    await hydrateTierAFromPersistence(organizationId, store);
    orgStores.set(organizationId, store);
    return;
  }

  const store = getOrgStore(organizationId);
  if (store.seeded) return;
  const seed = buildSalesSeedData(organizationId, ownerId);
  for (const a of seed.accounts) store.accounts.set(a.id, a);
  for (const c of seed.contacts) store.contacts.set(c.id, c);
  for (const o of seed.opportunities) store.opportunities.set(o.id, o);
  for (const i of seed.interactions) store.interactions.set(i.id, i);
  for (const i of seed.interactions) {
    store.activities.set(i.id, interactionToActivity(i, ownerId));
  }
  hydrateIntelligenceFromSeed(store, seed);
  store.seeded = true;
  schedulePersist(organizationId);
}

// ─── Generic CRUD helpers ───

export function putGovernedEntity<T extends { id: string; organizationId: string }>(
  organizationId: string,
  map: Map<string, T>,
  prefix: string,
  input: Omit<T, "id" | "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  },
): T {
  const ts = governedDefaults();
  const entity = {
    ...input,
    id: salesEntityId(prefix),
    createdAt: (input as { createdAt?: string }).createdAt ?? ts.createdAt,
    updatedAt: (input as { updatedAt?: string }).updatedAt ?? ts.updatedAt,
  } as unknown as T;
  map.set(entity.id, entity);
  schedulePersist(organizationId);
  return entity;
}

export function getGovernedEntity<T extends { id: string; organizationId: string }>(
  organizationId: string,
  map: Map<string, T>,
  entityId: string,
): T | undefined {
  const entity = map.get(entityId);
  return entity?.organizationId === organizationId ? entity : undefined;
}

export function updateGovernedEntity<
  T extends { id: string; organizationId: string; updatedAt: string },
>(
  organizationId: string,
  map: Map<string, T>,
  entityId: string,
  patch: Partial<T>,
): T | undefined {
  const existing = getGovernedEntity(organizationId, map, entityId);
  if (!existing) return undefined;
  const updated = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  map.set(entityId, updated);
  schedulePersist(organizationId);
  return updated;
}

export function deleteGovernedEntity<T extends { id: string; organizationId: string }>(
  organizationId: string,
  map: Map<string, T>,
  entityId: string,
): boolean {
  const existing = getGovernedEntity(organizationId, map, entityId);
  if (!existing) return false;
  map.delete(entityId);
  schedulePersist(organizationId);
  return true;
}

export function listGovernedForOpportunity<T extends { opportunityId?: string }>(
  items: T[],
  opportunityId: string,
): T[] {
  return items.filter((item) => item.opportunityId === opportunityId);
}

export function listGovernedForAccount<T extends { accountId?: string }>(
  items: T[],
  accountId: string,
): T[] {
  return items.filter((item) => item.accountId === accountId);
}
