// ─── SalesOS store (in-memory + optional file/prisma persistence) ───
// Tenant-scoped. Persists to .data/sales/{orgId}.json when SALESOS_FILE_PERSISTENCE=1.
// Persists to PostgreSQL when SALESOS_PRISMA_PERSISTENCE=1.

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
} from "./types";
import { activityToInteraction, interactionToActivity } from "./types";
import {
  governedDefaults,
  salesEntityId,
  salesTimestamps,
} from "./entity-factory";
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

function emptyIntelligenceMaps(): Pick<
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

function hydrateIntelligenceFromSeed(
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

const orgStores = new Map<string, OrgStore>();
const loadPromises = new Map<string, Promise<void>>();

const FILE_PERSISTENCE_ENABLED =
  process.env.SALESOS_FILE_PERSISTENCE === "1" ||
  process.env.SALESOS_FILE_PERSISTENCE === "true";

const PRISMA_PERSISTENCE_ENABLED =
  process.env.SALESOS_PRISMA_PERSISTENCE === "1" ||
  process.env.SALESOS_PRISMA_PERSISTENCE === "true";

/** Tier A intelligence file snapshot when Prisma has no Tier A tables yet (Agent 2). */
const TIER_A_FILE_SNAPSHOT_ENABLED =
  FILE_PERSISTENCE_ENABLED || PRISMA_PERSISTENCE_ENABLED;

async function hydrateTierAFromPersistence(
  organizationId: string,
  store: OrgStore,
): Promise<void> {
  const { hydrateTierAIntelligenceMaps } = await import("./tier-a-persistence");
  await hydrateTierAIntelligenceMaps(organizationId, store);
}

/** Test helper — clears in-memory org stores. */
export function resetSalesStoreForTests(): void {
  orgStores.clear();
  loadPromises.clear();
}

async function ensureOrgLoaded(organizationId: string): Promise<void> {
  if (orgStores.has(organizationId)) return;
  if (!FILE_PERSISTENCE_ENABLED && !PRISMA_PERSISTENCE_ENABLED) return;

  let pending = loadPromises.get(organizationId);
  if (!pending) {
    pending = (async () => {
      if (PRISMA_PERSISTENCE_ENABLED) {
        const { prismaLoadOrgSnapshot } = await import("./prisma-repository");
        const snapshot = await prismaLoadOrgSnapshot(organizationId);
        if (snapshot) {
          const store: OrgStore = {
            accounts: new Map(snapshot.accounts.map((a) => [a.id, a])),
            contacts: new Map(snapshot.contacts.map((c) => [c.id, c])),
            leads: new Map(),
            opportunities: new Map(
              snapshot.opportunities.map((o) => [o.id, o]),
            ),
            interactions: new Map(snapshot.interactions.map((i) => [i.id, i])),
            ...emptyIntelligenceMaps(),
            evidence: new Map(snapshot.evidence.map((e) => [e.id, e])),
            auditLog: [],
            seeded: snapshot.seeded,
          };
          await hydrateTierAFromPersistence(organizationId, store);
          orgStores.set(organizationId, store);
          return;
        }
      }

      if (FILE_PERSISTENCE_ENABLED) {
        const { loadSalesOrgSnapshot, hydrateOrgMaps } =
          await import("./persistence");
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

function persistPrismaWrite(
  organizationId: string,
  label: string,
  write: () => Promise<void>,
): void {
  if (!PRISMA_PERSISTENCE_ENABLED) return;
  void write().catch((error) => {
    console.error(
      `[SalesOS Prisma] ${label} failed for org ${organizationId}:`,
      error instanceof Error ? error.message : error,
    );
  });
}

function schedulePersist(organizationId: string): void {
  if (!TIER_A_FILE_SNAPSHOT_ENABLED) return;
  const store = orgStores.get(organizationId);
  if (!store) return;

  if (TIER_A_FILE_SNAPSHOT_ENABLED) {
    void (async () => {
      const { saveSalesOrgSnapshot, snapshotFromMaps } =
        await import("./persistence");
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

function getOrgStore(organizationId: string): OrgStore {
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

export async function ensureSalesSeed(
  organizationId: string,
  ownerId: string,
): Promise<void> {
  await ensureOrgLoaded(organizationId);

  if (PRISMA_PERSISTENCE_ENABLED) {
    const { prismaSeedOrg, prismaLoadOrgSnapshot } =
      await import("./prisma-repository");
    await prismaSeedOrg(organizationId, ownerId);
    const snapshot = await prismaLoadOrgSnapshot(organizationId);
    if (snapshot) {
      const store: OrgStore = {
        accounts: new Map(snapshot.accounts.map((a) => [a.id, a])),
        contacts: new Map(snapshot.contacts.map((c) => [c.id, c])),
        leads: new Map(),
        opportunities: new Map(snapshot.opportunities.map((o) => [o.id, o])),
        interactions: new Map(snapshot.interactions.map((i) => [i.id, i])),
        ...emptyIntelligenceMaps(),
        evidence: new Map(snapshot.evidence.map((e) => [e.id, e])),
        auditLog: [],
        seeded: true,
      };
      await hydrateTierAFromPersistence(organizationId, store);
      orgStores.set(organizationId, store);
      return;
    }
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
    source: input.source ?? "manual",
    id: `sales-acct-${crypto.randomUUID().slice(0, 8)}`,
    createdAt: now,
    updatedAt: now,
  };
  store.accounts.set(account.id, account);
  schedulePersist(input.organizationId);
  persistPrismaWrite(input.organizationId, "createAccount", async () => {
    const { prismaCreateAccount } = await import("./prisma-repository");
    await prismaCreateAccount(account);
  });
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

export function createOpportunity(
  input: Omit<SalesOpportunity, "id">,
): SalesOpportunity {
  const store = getOrgStore(input.organizationId);
  const opportunity: SalesOpportunity = {
    ...input,
    id: `sales-opp-${crypto.randomUUID().slice(0, 8)}`,
    stage: input.stage ?? "Draft",
  };
  store.opportunities.set(opportunity.id, opportunity);
  schedulePersist(input.organizationId);
  persistPrismaWrite(input.organizationId, "createOpportunity", async () => {
    const { prismaCreateOpportunity } = await import("./prisma-repository");
    await prismaCreateOpportunity(opportunity);
  });
  return opportunity;
}

export function createInteraction(
  input: Omit<SalesInteractionLog, "id" | "loggedAt">,
): SalesInteractionLog {
  const store = getOrgStore(input.organizationId);
  const interaction: SalesInteractionLog = {
    ...input,
    id: `sales-int-${crypto.randomUUID().slice(0, 8)}`,
    loggedAt: new Date().toISOString(),
  };
  store.interactions.set(interaction.id, interaction);
  schedulePersist(input.organizationId);
  persistPrismaWrite(input.organizationId, "createInteraction", async () => {
    const { prismaCreateInteraction } = await import("./prisma-repository");
    await prismaCreateInteraction(interaction);
  });
  return interaction;
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
  schedulePersist(organizationId);
  persistPrismaWrite(organizationId, "updateOpportunity", async () => {
    const { prismaUpdateOpportunity } = await import("./prisma-repository");
    await prismaUpdateOpportunity(organizationId, opportunityId, patch);
  });
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

export function listInteractionsForAccount(
  organizationId: string,
  accountId: string,
): SalesInteractionLog[] {
  return [...getOrgStore(organizationId).interactions.values()]
    .filter((i) => i.accountId === accountId)
    .sort(
      (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
    );
}

export function listAllInteractions(
  organizationId: string,
): SalesInteractionLog[] {
  return [...getOrgStore(organizationId).interactions.values()].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
  );
}

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
    const { prismaCreateEvidence } = await import("./prisma-repository");
    await prismaCreateEvidence(ref);
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

// ─── Activities (dual-write with interactions for backward compat) ───

export function listActivities(organizationId: string): SalesActivity[] {
  return [...getOrgStore(organizationId).activities.values()];
}

export function listActivitiesForOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesActivity[] {
  return listActivities(organizationId).filter(
    (a) => a.opportunityId === opportunityId,
  );
}

export function createActivity(
  input: Omit<SalesActivity, "id" | "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  },
): SalesActivity {
  const store = getOrgStore(input.organizationId);
  const ts = governedDefaults({
    source: input.source,
    status: input.status,
    confidence: input.confidence,
  });
  const activity: SalesActivity = {
    ...input,
    id: salesEntityId("sales-act"),
    createdAt: input.createdAt ?? ts.createdAt,
    updatedAt: input.updatedAt ?? ts.updatedAt,
    source: input.source ?? ts.source,
    status: input.status ?? ts.status,
    confidence:
      typeof input.confidence === "object"
        ? input.confidence
        : typeof ts.confidence === "object"
          ? ts.confidence
          : undefined,
  };
  store.activities.set(activity.id, activity);
  const interaction = activityToInteraction(activity);
  store.interactions.set(interaction.id, interaction);
  schedulePersist(input.organizationId);
  persistPrismaWrite(input.organizationId, "createInteraction", async () => {
    const { prismaCreateInteraction } = await import("./prisma-repository");
    await prismaCreateInteraction(interaction);
  });
  return activity;
}

export function createContact(
  input: Omit<SalesContact, "id" | "createdAt" | "updatedAt"> & {
    createdAt?: string;
    updatedAt?: string;
  },
): SalesContact {
  const store = getOrgStore(input.organizationId);
  const ts = governedDefaults({ source: input.source, status: input.status });
  const contact: SalesContact = {
    ...input,
    id: salesEntityId("sales-contact"),
    createdAt: input.createdAt ?? ts.createdAt,
    updatedAt: input.updatedAt ?? ts.updatedAt,
    source: input.source ?? ts.source,
    status: input.status ?? ts.status,
  };
  store.contacts.set(contact.id, contact);
  schedulePersist(input.organizationId);
  return contact;
}

function putGovernedEntity<T extends { id: string; organizationId: string }>(
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

function getGovernedEntity<T extends { id: string; organizationId: string }>(
  organizationId: string,
  map: Map<string, T>,
  entityId: string,
): T | undefined {
  const entity = map.get(entityId);
  return entity?.organizationId === organizationId ? entity : undefined;
}

function updateGovernedEntity<
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

function deleteGovernedEntity<T extends { id: string; organizationId: string }>(
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

function listGovernedForOpportunity<T extends { opportunityId?: string }>(
  items: T[],
  opportunityId: string,
): T[] {
  return items.filter((item) => item.opportunityId === opportunityId);
}

function listGovernedForAccount<T extends { accountId?: string }>(
  items: T[],
  accountId: string,
): T[] {
  return items.filter((item) => item.accountId === accountId);
}

export function listMeetings(organizationId: string): SalesMeeting[] {
  return [...getOrgStore(organizationId).meetings.values()];
}

export function listOutreach(organizationId: string): SalesOutreach[] {
  return [...getOrgStore(organizationId).outreach.values()];
}

export function createMeeting(
  input: Omit<
    SalesMeeting,
    "id" | "createdAt" | "updatedAt" | "status" | "source"
  >,
): SalesMeeting {
  const ts = salesTimestamps();
  return putGovernedEntity(
    input.organizationId,
    getOrgStore(input.organizationId).meetings,
    "sales-meeting",
    { ...input, status: "active", source: "manual", ...ts },
  );
}

export function listSignals(organizationId: string): SalesSignal[] {
  return [...getOrgStore(organizationId).signals.values()];
}

export function getSignal(
  organizationId: string,
  signalId: string,
): SalesSignal | undefined {
  return getGovernedEntity(
    organizationId,
    getOrgStore(organizationId).signals,
    signalId,
  );
}

export function listSignalsForOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesSignal[] {
  return listGovernedForOpportunity(listSignals(organizationId), opportunityId);
}

export function listSignalsForAccount(
  organizationId: string,
  accountId: string,
): SalesSignal[] {
  return listGovernedForAccount(listSignals(organizationId), accountId);
}

export function createSignal(
  input: Omit<
    SalesSignal,
    "id" | "createdAt" | "updatedAt" | "status" | "source"
  >,
): SalesSignal {
  const ts = salesTimestamps();
  return putGovernedEntity(
    input.organizationId,
    getOrgStore(input.organizationId).signals,
    "sales-signal",
    { ...input, status: "active", source: "ai_draft", ...ts },
  );
}

export function updateSignal(
  organizationId: string,
  signalId: string,
  patch: Partial<SalesSignal>,
): SalesSignal | undefined {
  return updateGovernedEntity(
    organizationId,
    getOrgStore(organizationId).signals,
    signalId,
    patch,
  );
}

export function deleteSignal(
  organizationId: string,
  signalId: string,
): boolean {
  return deleteGovernedEntity(
    organizationId,
    getOrgStore(organizationId).signals,
    signalId,
  );
}

export function listObjections(organizationId: string): SalesObjection[] {
  return [...getOrgStore(organizationId).objections.values()];
}

export function getObjection(
  organizationId: string,
  objectionId: string,
): SalesObjection | undefined {
  return getGovernedEntity(
    organizationId,
    getOrgStore(organizationId).objections,
    objectionId,
  );
}

export function listObjectionsForOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesObjection[] {
  return listGovernedForOpportunity(
    listObjections(organizationId),
    opportunityId,
  );
}

export function listObjectionsForAccount(
  organizationId: string,
  accountId: string,
): SalesObjection[] {
  return listGovernedForAccount(listObjections(organizationId), accountId);
}

export function createObjection(
  input: Omit<
    SalesObjection,
    "id" | "createdAt" | "updatedAt" | "status" | "source"
  >,
): SalesObjection {
  const ts = salesTimestamps();
  return putGovernedEntity(
    input.organizationId,
    getOrgStore(input.organizationId).objections,
    "sales-objection",
    { ...input, status: "active", source: "manual", ...ts },
  );
}

export function updateObjection(
  organizationId: string,
  objectionId: string,
  patch: Partial<SalesObjection>,
): SalesObjection | undefined {
  return updateGovernedEntity(
    organizationId,
    getOrgStore(organizationId).objections,
    objectionId,
    patch,
  );
}

export function deleteObjection(
  organizationId: string,
  objectionId: string,
): boolean {
  return deleteGovernedEntity(
    organizationId,
    getOrgStore(organizationId).objections,
    objectionId,
  );
}

export function listCompetitorMentions(
  organizationId: string,
): SalesCompetitorMention[] {
  return [...getOrgStore(organizationId).competitorMentions.values()];
}

export function getCompetitorMention(
  organizationId: string,
  mentionId: string,
): SalesCompetitorMention | undefined {
  return getGovernedEntity(
    organizationId,
    getOrgStore(organizationId).competitorMentions,
    mentionId,
  );
}

export function listCompetitorMentionsForOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesCompetitorMention[] {
  return listGovernedForOpportunity(
    listCompetitorMentions(organizationId),
    opportunityId,
  );
}

export function createCompetitorMention(
  input: Omit<
    SalesCompetitorMention,
    "id" | "createdAt" | "updatedAt" | "status" | "source"
  >,
): SalesCompetitorMention {
  const ts = salesTimestamps();
  return putGovernedEntity(
    input.organizationId,
    getOrgStore(input.organizationId).competitorMentions,
    "sales-comp",
    { ...input, status: "active", source: "manual", ...ts },
  );
}

export function updateCompetitorMention(
  organizationId: string,
  mentionId: string,
  patch: Partial<SalesCompetitorMention>,
): SalesCompetitorMention | undefined {
  return updateGovernedEntity(
    organizationId,
    getOrgStore(organizationId).competitorMentions,
    mentionId,
    patch,
  );
}

export function deleteCompetitorMention(
  organizationId: string,
  mentionId: string,
): boolean {
  return deleteGovernedEntity(
    organizationId,
    getOrgStore(organizationId).competitorMentions,
    mentionId,
  );
}

export function listProofAssets(organizationId: string): SalesProofAsset[] {
  return [...getOrgStore(organizationId).proofAssets.values()];
}

export function getProofAsset(
  organizationId: string,
  assetId: string,
): SalesProofAsset | undefined {
  return getGovernedEntity(
    organizationId,
    getOrgStore(organizationId).proofAssets,
    assetId,
  );
}

export function listProofAssetsForOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesProofAsset[] {
  return listProofAssets(organizationId).filter(
    (a) =>
      a.opportunityId === opportunityId ||
      a.linkedOpportunityIds?.includes(opportunityId),
  );
}

export function createProofAsset(
  input: Omit<
    SalesProofAsset,
    "id" | "createdAt" | "updatedAt" | "status" | "source"
  >,
): SalesProofAsset {
  const ts = salesTimestamps();
  return putGovernedEntity(
    input.organizationId,
    getOrgStore(input.organizationId).proofAssets,
    "sales-proof",
    { ...input, status: "active", source: "manual", ...ts },
  );
}

export function updateProofAsset(
  organizationId: string,
  assetId: string,
  patch: Partial<SalesProofAsset>,
): SalesProofAsset | undefined {
  return updateGovernedEntity(
    organizationId,
    getOrgStore(organizationId).proofAssets,
    assetId,
    patch,
  );
}

export function deleteProofAsset(
  organizationId: string,
  assetId: string,
): boolean {
  return deleteGovernedEntity(
    organizationId,
    getOrgStore(organizationId).proofAssets,
    assetId,
  );
}

export function listICPInsights(organizationId: string): SalesICPInsight[] {
  return [...getOrgStore(organizationId).icpInsights.values()];
}

export function getICPInsight(
  organizationId: string,
  insightId: string,
): SalesICPInsight | undefined {
  return getGovernedEntity(
    organizationId,
    getOrgStore(organizationId).icpInsights,
    insightId,
  );
}

export function createICPInsight(
  input: Omit<
    SalesICPInsight,
    "id" | "createdAt" | "updatedAt" | "status" | "source"
  >,
): SalesICPInsight {
  const ts = salesTimestamps();
  return putGovernedEntity(
    input.organizationId,
    getOrgStore(input.organizationId).icpInsights,
    "sales-icp",
    { ...input, status: "active", source: "ai_draft", ...ts },
  );
}

export function updateICPInsight(
  organizationId: string,
  insightId: string,
  patch: Partial<SalesICPInsight>,
): SalesICPInsight | undefined {
  return updateGovernedEntity(
    organizationId,
    getOrgStore(organizationId).icpInsights,
    insightId,
    patch,
  );
}

export function deleteICPInsight(
  organizationId: string,
  insightId: string,
): boolean {
  return deleteGovernedEntity(
    organizationId,
    getOrgStore(organizationId).icpInsights,
    insightId,
  );
}

export function listNextActions(organizationId: string): SalesNextAction[] {
  return [...getOrgStore(organizationId).nextActions.values()];
}

export function getNextAction(
  organizationId: string,
  actionId: string,
): SalesNextAction | undefined {
  return getGovernedEntity(
    organizationId,
    getOrgStore(organizationId).nextActions,
    actionId,
  );
}

export function listNextActionsForOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesNextAction[] {
  return listGovernedForOpportunity(
    listNextActions(organizationId),
    opportunityId,
  );
}

export function createNextAction(
  input: Omit<
    SalesNextAction,
    "id" | "createdAt" | "updatedAt" | "status" | "source"
  >,
): SalesNextAction {
  const ts = salesTimestamps();
  return putGovernedEntity(
    input.organizationId,
    getOrgStore(input.organizationId).nextActions,
    "sales-next",
    { ...input, status: "draft", source: "ai_draft", ...ts },
  );
}

export function updateNextAction(
  organizationId: string,
  actionId: string,
  patch: Partial<SalesNextAction>,
): SalesNextAction | undefined {
  return updateGovernedEntity(
    organizationId,
    getOrgStore(organizationId).nextActions,
    actionId,
    patch,
  );
}

export function deleteNextAction(
  organizationId: string,
  actionId: string,
): boolean {
  return deleteGovernedEntity(
    organizationId,
    getOrgStore(organizationId).nextActions,
    actionId,
  );
}

export function listWinLossInsights(
  organizationId: string,
): SalesWinLossInsight[] {
  return [...getOrgStore(organizationId).winLossInsights.values()];
}

export function getWinLossInsight(
  organizationId: string,
  insightId: string,
): SalesWinLossInsight | undefined {
  return getGovernedEntity(
    organizationId,
    getOrgStore(organizationId).winLossInsights,
    insightId,
  );
}

export function listWinLossInsightsForOpportunity(
  organizationId: string,
  opportunityId: string,
): SalesWinLossInsight[] {
  return listWinLossInsights(organizationId).filter(
    (w) => w.opportunityId === opportunityId,
  );
}

export function createWinLossInsight(
  input: Omit<
    SalesWinLossInsight,
    "id" | "createdAt" | "updatedAt" | "status" | "source"
  >,
): SalesWinLossInsight {
  const ts = salesTimestamps();
  return putGovernedEntity(
    input.organizationId,
    getOrgStore(input.organizationId).winLossInsights,
    "sales-wl",
    { ...input, status: "active", source: "manual", ...ts },
  );
}

export function updateWinLossInsight(
  organizationId: string,
  insightId: string,
  patch: Partial<SalesWinLossInsight>,
): SalesWinLossInsight | undefined {
  return updateGovernedEntity(
    organizationId,
    getOrgStore(organizationId).winLossInsights,
    insightId,
    patch,
  );
}

export function deleteWinLossInsight(
  organizationId: string,
  insightId: string,
): boolean {
  return deleteGovernedEntity(
    organizationId,
    getOrgStore(organizationId).winLossInsights,
    insightId,
  );
}
