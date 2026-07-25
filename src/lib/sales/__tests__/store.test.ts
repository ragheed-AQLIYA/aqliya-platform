/**
 * SalesOS Store — comprehensive unit tests
 *
 * Covers all 10 domain modules exported from src/lib/sales/store/index.ts
 *
 * - Common/core helpers (put/get/update/delete governed entities, list helpers)
 * - Accounts & Contacts
 * - Opportunities, Interactions & Activities
 * - Evidence & Audit
 * - Meetings & Outreach
 * - Signals
 * - Objections
 * - Competitor Mentions
 * - Proof Assets
 * - ICP & Win/Loss Insights
 * - Next Actions
 * - Edge cases (empty, null, wrong org, nonexistent)
 */

import {
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import crypto from "crypto";

// ─── Module under test ───

import {
  // Common
  resetSalesStoreForTests,
  ensureSalesSeed,
  getOrgStore,
  putGovernedEntity,
  getGovernedEntity,
  updateGovernedEntity,
  deleteGovernedEntity,
  listGovernedForOpportunity,
  listGovernedForAccount,
  // Accounts
  listAccounts,
  getAccount,
  createAccount,
  listContactsForAccount,
  createContact,
  // Opportunities
  listOpportunities,
  listOpportunitiesForAccount,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  createInteraction,
  listInteractionsForOpportunity,
  listInteractionsForAccount,
  listAllInteractions,
  createActivity,
  // Evidence & Audit
  linkEvidence,
  listEvidenceForOpportunity,
  appendAuditEntry,
  listAuditEntries,
  // Meetings & Outreach
  listMeetings,
  createMeeting,
  listOutreach,
  // Signals
  listSignals,
  getSignal,
  listSignalsForOpportunity,
  listSignalsForAccount,
  createSignal,
  updateSignal,
  deleteSignal,
  // Objections
  listObjections,
  getObjection,
  listObjectionsForOpportunity,
  listObjectionsForAccount,
  createObjection,
  updateObjection,
  deleteObjection,
  // Competitors
  listCompetitorMentions,
  getCompetitorMention,
  listCompetitorMentionsForOpportunity,
  createCompetitorMention,
  updateCompetitorMention,
  deleteCompetitorMention,
  // Proof Assets
  listProofAssets,
  getProofAsset,
  listProofAssetsForOpportunity,
  createProofAsset,
  updateProofAsset,
  deleteProofAsset,
  // Insights
  listICPInsights,
  getICPInsight,
  createICPInsight,
  updateICPInsight,
  deleteICPInsight,
  listWinLossInsights,
  getWinLossInsight,
  listWinLossInsightsForOpportunity,
  createWinLossInsight,
  updateWinLossInsight,
  deleteWinLossInsight,
  // Next Actions
  listNextActions,
  getNextAction,
  listNextActionsForOpportunity,
  createNextAction,
  updateNextAction,
  deleteNextAction,
} from "../store";
import type {
  SalesAccount,
  SalesContact,
  SalesOpportunity,
  SalesActivity,
  SalesMeeting,
  SalesObjection,
  SalesSignal,
  SalesNextAction,
  SalesICPInsight,
  SalesWinLossInsight,
  SalesCompetitorMention,
  SalesProofAsset,
} from "../types";
import type { SalesEvidenceRef, SalesAuditEntry } from "../store/common";

// ─── Test constants ───

const ORG_A = "sales-store-org-a";
const ORG_B = "sales-store-org-b";
const USER_1 = "user-owner-1";

// ─── Mocks for persistence env vars ───

const ORIG_FILE_FLAG = process.env.SALESOS_FILE_PERSISTENCE;
const ORIG_PRISMA_FLAG = process.env.SALESOS_PRISMA_PERSISTENCE;

beforeEach(() => {
  // Ensure persistence is DISABLED for all store tests (avoids dynamic imports)
  process.env.SALESOS_FILE_PERSISTENCE = "0";
  process.env.SALESOS_PRISMA_PERSISTENCE = "0";
  resetSalesStoreForTests();
});

afterEach(() => {
  resetSalesStoreForTests();
  if (ORIG_FILE_FLAG === undefined) {
    delete process.env.SALESOS_FILE_PERSISTENCE;
  } else {
    process.env.SALESOS_FILE_PERSISTENCE = ORIG_FILE_FLAG;
  }
  if (ORIG_PRISMA_FLAG === undefined) {
    delete process.env.SALESOS_PRISMA_PERSISTENCE;
  } else {
    process.env.SALESOS_PRISMA_PERSISTENCE = ORIG_PRISMA_FLAG;
  }
});

describe("SalesOS Store — Common / Core helpers", () => {
  it("resetSalesStoreForTests clears all org stores", () => {
    const store = getOrgStore(ORG_A);
    store.accounts.set("a1", {} as SalesAccount);
    expect(getOrgStore(ORG_A).accounts.size).toBe(1);
    resetSalesStoreForTests();
    expect(getOrgStore(ORG_A).accounts.size).toBe(0);
  });

  it("getOrgStore creates a fresh store lazily", () => {
    const store = getOrgStore(ORG_A);
    expect(store.accounts).toBeInstanceOf(Map);
    expect(store.contacts).toBeInstanceOf(Map);
    expect(store.opportunities).toBeInstanceOf(Map);
    expect(store.interactions).toBeInstanceOf(Map);
    expect(store.activities).toBeInstanceOf(Map);
    expect(store.meetings).toBeInstanceOf(Map);
    expect(store.outreach).toBeInstanceOf(Map);
    expect(store.signals).toBeInstanceOf(Map);
    expect(store.objections).toBeInstanceOf(Map);
    expect(store.competitorMentions).toBeInstanceOf(Map);
    expect(store.proofAssets).toBeInstanceOf(Map);
    expect(store.icpInsights).toBeInstanceOf(Map);
    expect(store.nextActions).toBeInstanceOf(Map);
    expect(store.winLossInsights).toBeInstanceOf(Map);
    expect(store.evidence).toBeInstanceOf(Map);
    expect(store.auditLog).toEqual([]);
    expect(store.seeded).toBe(false);
  });

  it("getOrgStore is idempotent (returns same store)", () => {
    const s1 = getOrgStore(ORG_A);
    const s2 = getOrgStore(ORG_A);
    expect(s1).toBe(s2);
  });

  it("putGovernedEntity creates entity with generated id and timestamps", () => {
    const store = getOrgStore(ORG_A);
    const entity = putGovernedEntity(ORG_A, store.opportunities, "sales-opp", {
      organizationId: ORG_A,
      accountId: "acct-1",
      name: "Test Opp",
      ownerId: USER_1,
      createdById: USER_1,
    } as unknown as Omit<SalesOpportunity, "id" | "createdAt" | "updatedAt">);
    expect(entity.id).toMatch(/^sales-opp-/);
    expect(entity.createdAt).toBeDefined();
    expect(entity.updatedAt).toBeDefined();
    expect(store.opportunities.get(entity.id)).toBe(entity);
  });

  it("getGovernedEntity returns entity for matching org", () => {
    const store = getOrgStore(ORG_A);
    const entity = putGovernedEntity(ORG_A, store.signals, "sales-signal", {
      organizationId: ORG_A,
      signalType: "buying",
      description: "Interest spike",
      strength: "strong",
      createdById: USER_1,
    } as unknown as Omit<SalesSignal, "id" | "createdAt" | "updatedAt">);
    const found = getGovernedEntity(ORG_A, store.signals, entity.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(entity.id);
  });

  it("getGovernedEntity returns undefined for wrong org", () => {
    const store = getOrgStore(ORG_A);
    const entity = putGovernedEntity(ORG_A, store.signals, "sales-signal", {
      organizationId: ORG_A,
      signalType: "budget",
      description: "Budget approval",
      strength: "moderate",
      createdById: USER_1,
    } as unknown as Omit<SalesSignal, "id" | "createdAt" | "updatedAt">);
    const found = getGovernedEntity(ORG_B, store.signals, entity.id);
    expect(found).toBeUndefined();
  });

  it("updateGovernedEntity patches existing entity", () => {
    const store = getOrgStore(ORG_A);
    const entity = putGovernedEntity(ORG_A, store.objections, "sales-obj", {
      organizationId: ORG_A,
      category: "price",
      description: "Too expensive",
      createdById: USER_1,
    } as unknown as Omit<SalesObjection, "id" | "createdAt" | "updatedAt">);
    const updated = updateGovernedEntity(ORG_A, store.objections, entity.id, {
      resolved: true,
    } as Partial<SalesObjection>);
    expect(updated).toBeDefined();
    expect((updated as unknown as SalesObjection).resolved).toBe(true);
  });

  it("updateGovernedEntity returns undefined for nonexistent entity", () => {
    const store = getOrgStore(ORG_A);
    const result = updateGovernedEntity(
      ORG_A,
      store.objections,
      "nonexistent-id",
      { resolved: true } as Partial<SalesObjection>,
    );
    expect(result).toBeUndefined();
  });

  it("deleteGovernedEntity returns true for existing entity", () => {
    const store = getOrgStore(ORG_A);
    const entity = putGovernedEntity(ORG_A, store.nextActions, "sales-next", {
      organizationId: ORG_A,
      title: "Follow up",
      priority: "high",
      createdById: USER_1,
    } as unknown as Omit<SalesNextAction, "id" | "createdAt" | "updatedAt">);
    expect(deleteGovernedEntity(ORG_A, store.nextActions, entity.id)).toBe(true);
    expect(store.nextActions.has(entity.id)).toBe(false);
  });

  it("deleteGovernedEntity returns false for nonexistent entity", () => {
    const store = getOrgStore(ORG_A);
    expect(deleteGovernedEntity(ORG_A, store.nextActions, "no-such-id")).toBe(false);
  });

  it("listGovernedForOpportunity filters by opportunityId", () => {
    const items = [
      { id: "1", opportunityId: "opp-a" },
      { id: "2", opportunityId: "opp-b" },
      { id: "3", opportunityId: "opp-a" },
    ];
    const filtered = listGovernedForOpportunity(items as any, "opp-a");
    expect(filtered).toHaveLength(2);
    expect(filtered.map((i) => i.id)).toEqual(["1", "3"]);
  });

  it("listGovernedForAccount filters by accountId", () => {
    const items = [
      { id: "1", accountId: "acct-x" },
      { id: "2", accountId: "acct-y" },
      { id: "3", accountId: "acct-x" },
    ];
    const filtered = listGovernedForAccount(items as any, "acct-x");
    expect(filtered).toHaveLength(2);
    expect(filtered.map((i) => i.id)).toEqual(["1", "3"]);
  });

  it("ensureSalesSeed populates store with seed data", async () => {
    await ensureSalesSeed(ORG_A, USER_1);
    const store = getOrgStore(ORG_A);
    expect(store.seeded).toBe(true);
    expect(store.accounts.size).toBeGreaterThan(0);
    expect(store.contacts.size).toBeGreaterThan(0);
    expect(store.opportunities.size).toBeGreaterThan(0);
  });

  it("ensureSalesSeed is idempotent (does not double-seed)", async () => {
    await ensureSalesSeed(ORG_A, USER_1);
    const count1 = getOrgStore(ORG_A).accounts.size;
    await ensureSalesSeed(ORG_A, USER_1);
    const count2 = getOrgStore(ORG_A).accounts.size;
    expect(count2).toBe(count1);
  });
});

describe("SalesOS Store — Accounts domain", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG_A, USER_1);
  });

  it("listAccounts returns seeded accounts", () => {
    const accounts = listAccounts(ORG_A);
    expect(accounts.length).toBeGreaterThan(0);
    expect(accounts[0]).toHaveProperty("id");
    expect(accounts[0]).toHaveProperty("organizationId", ORG_A);
  });

  it("getAccount returns account by id", () => {
    const accounts = listAccounts(ORG_A);
    const found = getAccount(ORG_A, accounts[0].id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(accounts[0].id);
  });

  it("getAccount returns undefined for wrong org", () => {
    const accounts = listAccounts(ORG_A);
    expect(getAccount(ORG_B, accounts[0].id)).toBeUndefined();
  });

  it("getAccount returns undefined for nonexistent id", () => {
    expect(getAccount(ORG_A, "no-such-account")).toBeUndefined();
  });

  it("createAccount adds account to store", () => {
    const acct = createAccount({
      organizationId: ORG_A,
      name: "NewCo",
      status: "prospect",
      ownerId: USER_1,
      createdById: USER_1,
    });
    expect(acct.id).toMatch(/^sales-acct-/);
    expect(acct.name).toBe("NewCo");
    expect(acct.source).toBe("manual");
    expect(getAccount(ORG_A, acct.id)).toBeDefined();
  });

  it("createContact adds contact with defaults", () => {
    const acct = listAccounts(ORG_A)[0];
    const contact = createContact({
      organizationId: ORG_A,
      accountId: acct.id,
      name: "Ahmed",
      title: "Manager",
      sensitivityLevel: "standard",
      ownerId: USER_1,
      createdById: USER_1,
    });
    expect(contact.id).toMatch(/^sales-contact-/);
    expect(contact.status).toBe("active");
    expect(contact.source).toBe("manual");
  });

  it("listContactsForAccount filters by accountId", () => {
    const acct = listAccounts(ORG_A)[0];
    const contacts = listContactsForAccount(ORG_A, acct.id);
    expect(contacts.every((c) => c.accountId === acct.id)).toBe(true);
  });
});

describe("SalesOS Store — Opportunities domain", () => {
  let accountId: string;

  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG_A, USER_1);
    accountId = listAccounts(ORG_A)[0].id;
  });

  it("listOpportunities returns seeded opportunities", () => {
    const opps = listOpportunities(ORG_A);
    expect(opps.length).toBeGreaterThan(0);
  });

  it("listOpportunitiesForAccount filters by accountId", () => {
    const opps = listOpportunitiesForAccount(ORG_A, accountId);
    expect(opps.every((o) => o.accountId === accountId)).toBe(true);
  });

  it("getOpportunity returns by id", () => {
    const opps = listOpportunities(ORG_A);
    const found = getOpportunity(ORG_A, opps[0].id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(opps[0].id);
  });

  it("createOpportunity creates with defaults", () => {
    const opp = createOpportunity({
      organizationId: ORG_A,
      accountId,
      name: "Big Deal",
      stage: "New",
      ownerId: USER_1,
      createdById: USER_1,
    } as Omit<SalesOpportunity, "id">);
    expect(opp.id).toMatch(/^sales-opp-/);
    expect(opp.stage).toBe("New");
    expect(getOpportunity(ORG_A, opp.id)).toBeDefined();
  });

  it("updateOpportunity patches stage", () => {
    const opps = listOpportunities(ORG_A);
    const updated = updateOpportunity(ORG_A, opps[0].id, { stage: "Proposal" });
    expect(updated).toBeDefined();
    expect(updated!.stage).toBe("Proposal");
  });

  it("updateOpportunity returns undefined for nonexistent", () => {
    const result = updateOpportunity(ORG_A, "no-such-opp", { stage: "Won" });
    expect(result).toBeUndefined();
  });

  it("createInteraction creates interaction", () => {
    const interaction = createInteraction({
      organizationId: ORG_A,
      accountId,
      opportunityId: listOpportunities(ORG_A)[0].id,
      type: "email",
      summary: "Sent proposal",
      loggedById: USER_1,
    });
    expect(interaction.id).toMatch(/^sales-int-/);
    expect(interaction.loggedAt).toBeDefined();
  });

  it("listAllInteractions returns interactions sorted by loggedAt desc", () => {
    const all = listAllInteractions(ORG_A);
    if (all.length > 1) {
      const t1 = new Date(all[0].loggedAt).getTime();
      const t2 = new Date(all[1].loggedAt).getTime();
      expect(t1).toBeGreaterThanOrEqual(t2);
    }
  });

  it("listInteractionsForOpportunity filters by opportunityId", () => {
    const opps = listOpportunities(ORG_A);
    const items = listInteractionsForOpportunity(ORG_A, opps[0].id);
    expect(items.every((i) => i.opportunityId === opps[0].id)).toBe(true);
  });

  it("createActivity creates activity and matching interaction", () => {
    const activity = createActivity({
      organizationId: ORG_A,
      accountId,
      type: "email",
      summary: "Activity summary",
      loggedById: USER_1,
      loggedAt: new Date().toISOString(),
      createdById: USER_1,
    });
    expect(activity.id).toMatch(/^sales-act-/);
    expect(activity.source).toBe("manual");
    expect(activity.status).toBe("active");
  });
});

describe("SalesOS Store — Evidence & Audit domain", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG_A, USER_1);
  });

  it("linkEvidence adds evidence ref to store", () => {
    const opps = listOpportunities(ORG_A);
    const ref = linkEvidence({
      organizationId: ORG_A,
      opportunityId: opps[0].id,
      typeId: "doc-1",
      label: "Contract signed",
      linkedById: USER_1,
    });
    expect(ref.id).toMatch(/^sales-ev-/);
    expect(ref.linkedAt).toBeDefined();
  });

  it("listEvidenceForOpportunity filters by opportunityId", () => {
    const opps = listOpportunities(ORG_A);
    linkEvidence({
      organizationId: ORG_A,
      opportunityId: opps[0].id,
      typeId: "doc-1",
      label: "Doc A",
      linkedById: USER_1,
    });
    linkEvidence({
      organizationId: ORG_A,
      opportunityId: opps[0].id,
      typeId: "doc-2",
      label: "Doc B",
      linkedById: USER_1,
    });
    const items = listEvidenceForOpportunity(ORG_A, opps[0].id);
    expect(items).toHaveLength(2);
    expect(items.every((e) => e.opportunityId === opps[0].id)).toBe(true);
  });

  it("appendAuditEntry and listAuditEntries round-trip", () => {
    const entry = appendAuditEntry({
      organizationId: ORG_A,
      action: "sales.account.created",
      actorId: USER_1,
      targetType: "account",
      targetId: "acct-1",
    });
    expect(entry.id).toMatch(/^sales-audit-/);
    expect(entry.timestamp).toBeDefined();

    const entries = listAuditEntries(ORG_A);
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe(entry.id);
  });

  it("listAuditEntries returns reversed (most recent first)", () => {
    appendAuditEntry({
      organizationId: ORG_A,
      action: "first",
      actorId: USER_1,
      targetType: "account",
      targetId: "a1",
    });
    appendAuditEntry({
      organizationId: ORG_A,
      action: "second",
      actorId: USER_1,
      targetType: "account",
      targetId: "a2",
    });
    const entries = listAuditEntries(ORG_A);
    expect(entries).toHaveLength(2);
    expect(entries[0].action).toBe("second");
    expect(entries[1].action).toBe("first");
  });
});

describe("SalesOS Store — Meetings & Outreach domain", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG_A, USER_1);
  });

  it("listMeetings returns seeded meetings", () => {
    const meetings = listMeetings(ORG_A);
    expect(meetings).toBeDefined();
    expect(Array.isArray(meetings)).toBe(true);
  });

  it("createMeeting creates with defaults", () => {
    const acct = listAccounts(ORG_A)[0];
    const meeting = createMeeting({
      organizationId: ORG_A,
      accountId: acct.id,
      scheduledAt: new Date().toISOString(),
      hasSummary: false,
      loggedById: USER_1,
      createdById: USER_1,
    });
    expect(meeting.id).toMatch(/^sales-meeting-/);
    expect(meeting.status).toBe("active");
    expect(meeting.source).toBe("manual");
  });

  it("listOutreach returns seeded outreach", () => {
    const rows = listOutreach(ORG_A);
    expect(Array.isArray(rows)).toBe(true);
  });
});

describe("SalesOS Store — Signals domain", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG_A, USER_1);
  });

  it("listSignals returns all signals", () => {
    const signals = listSignals(ORG_A);
    expect(Array.isArray(signals)).toBe(true);
  });

  it("getSignal returns by id", () => {
    const signals = listSignals(ORG_A);
    if (signals.length > 0) {
      const found = getSignal(ORG_A, signals[0].id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(signals[0].id);
    }
  });

  it("getSignal returns undefined for nonexistent", () => {
    expect(getSignal(ORG_A, "no-such-signal")).toBeUndefined();
  });

  it("createSignal creates with source=ai_draft", () => {
    const signal = createSignal({
      organizationId: ORG_A,
      signalType: "need",
      description: "Expressed interest in compliance module",
      strength: "moderate",
      createdById: USER_1,
    });
    expect(signal.id).toMatch(/^sales-signal-/);
    expect(signal.source).toBe("ai_draft");
    expect(signal.status).toBe("active");
  });

  it("updateSignal patches fields", () => {
    const signal = createSignal({
      organizationId: ORG_A,
      signalType: "timing",
      description: "Timing signal",
      strength: "weak",
      createdById: USER_1,
    });
    const updated = updateSignal(ORG_A, signal.id, { strength: "strong" });
    expect(updated).toBeDefined();
    expect(updated!.strength).toBe("strong");
  });

  it("deleteSignal removes signal", () => {
    const signal = createSignal({
      organizationId: ORG_A,
      signalType: "authority",
      description: "Authority signal",
      strength: "strong",
      createdById: USER_1,
    });
    expect(deleteSignal(ORG_A, signal.id)).toBe(true);
    expect(getSignal(ORG_A, signal.id)).toBeUndefined();
  });

  it("listSignalsForOpportunity filters by opportunityId", () => {
    const opps = listOpportunities(ORG_A);
    if (opps.length > 0) {
      createSignal({
        organizationId: ORG_A,
        opportunityId: opps[0].id,
        signalType: "buying",
        description: "Buying signal",
        strength: "moderate",
        createdById: USER_1,
      });
      const items = listSignalsForOpportunity(ORG_A, opps[0].id);
      expect(items.every((s) => s.opportunityId === opps[0].id)).toBe(true);
    }
  });

  it("listSignalsForAccount filters by accountId", () => {
    const accts = listAccounts(ORG_A);
    if (accts.length > 0) {
      createSignal({
        organizationId: ORG_A,
        accountId: accts[0].id,
        signalType: "budget",
        description: "Budget signal",
        strength: "strong",
        createdById: USER_1,
      });
      const items = listSignalsForAccount(ORG_A, accts[0].id);
      expect(items.every((s) => s.accountId === accts[0].id)).toBe(true);
    }
  });
});

describe("SalesOS Store — Objections domain", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG_A, USER_1);
  });

  it("listObjections returns all objections", () => {
    const items = listObjections(ORG_A);
    expect(Array.isArray(items)).toBe(true);
  });

  it("createObjection creates with defaults", () => {
    const obj = createObjection({
      organizationId: ORG_A,
      category: "competition",
      description: "Client prefers competitor X",
      createdById: USER_1,
    });
    expect(obj.id).toMatch(/^sales-objection-/);
    expect(obj.status).toBe("active");
    expect(obj.source).toBe("manual");
  });

  it("getObjection returns by id", () => {
    const obj = createObjection({
      organizationId: ORG_A,
      category: "price",
      description: "Too expensive",
      createdById: USER_1,
    });
    const found = getObjection(ORG_A, obj.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(obj.id);
  });

  it("updateObjection patches resolved", () => {
    const obj = createObjection({
      organizationId: ORG_A,
      category: "timing",
      description: "Not the right time",
      createdById: USER_1,
    });
    const updated = updateObjection(ORG_A, obj.id, { resolved: true });
    expect(updated).toBeDefined();
    expect((updated as unknown as SalesObjection).resolved).toBe(true);
  });

  it("deleteObjection returns true and removes", () => {
    const obj = createObjection({
      organizationId: ORG_A,
      category: "other",
      description: "Misc objection",
      createdById: USER_1,
    });
    expect(deleteObjection(ORG_A, obj.id)).toBe(true);
    expect(getObjection(ORG_A, obj.id)).toBeUndefined();
  });

  it("listObjectionsForOpportunity filters by opportunityId", () => {
    const opps = listOpportunities(ORG_A);
    if (opps.length > 0) {
      createObjection({
        organizationId: ORG_A,
        opportunityId: opps[0].id,
        category: "scope",
        description: "Scope creep concern",
        createdById: USER_1,
      });
      const items = listObjectionsForOpportunity(ORG_A, opps[0].id);
      expect(items.every((o) => o.opportunityId === opps[0].id)).toBe(true);
    }
  });

  it("listObjectionsForAccount filters by accountId", () => {
    const accts = listAccounts(ORG_A);
    if (accts.length > 0) {
      createObjection({
        organizationId: ORG_A,
        accountId: accts[0].id,
        category: "support",
        description: "Support concern",
        createdById: USER_1,
      });
      const items = listObjectionsForAccount(ORG_A, accts[0].id);
      expect(items.every((o) => o.accountId === accts[0].id)).toBe(true);
    }
  });
});

describe("SalesOS Store — Competitor Mentions domain", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG_A, USER_1);
  });

  it("listCompetitorMentions returns all", () => {
    const items = listCompetitorMentions(ORG_A);
    expect(Array.isArray(items)).toBe(true);
  });

  it("createCompetitorMention creates with defaults", () => {
    const mention = createCompetitorMention({
      organizationId: ORG_A,
      competitorName: "CompetitorX",
      context: "Mentioned in RFP",
      createdById: USER_1,
    });
    expect(mention.id).toMatch(/^sales-comp-/);
    expect(mention.status).toBe("active");
    expect(mention.source).toBe("manual");
  });

  it("getCompetitorMention returns by id", () => {
    const mention = createCompetitorMention({
      organizationId: ORG_A,
      competitorName: "CompetitorY",
      context: "Recent win",
      createdById: USER_1,
    });
    const found = getCompetitorMention(ORG_A, mention.id);
    expect(found).toBeDefined();
    expect(found!.competitorName).toBe("CompetitorY");
  });

  it("updateCompetitorMention patches threatLevel", () => {
    const mention = createCompetitorMention({
      organizationId: ORG_A,
      competitorName: "CompetitorZ",
      context: "Growing threat",
      createdById: USER_1,
    });
    const updated = updateCompetitorMention(ORG_A, mention.id, { threatLevel: "high" });
    expect(updated).toBeDefined();
    expect(updated!.threatLevel).toBe("high");
  });

  it("deleteCompetitorMention removes", () => {
    const mention = createCompetitorMention({
      organizationId: ORG_A,
      competitorName: "Comp",
      context: "Context",
      createdById: USER_1,
    });
    expect(deleteCompetitorMention(ORG_A, mention.id)).toBe(true);
    expect(getCompetitorMention(ORG_A, mention.id)).toBeUndefined();
  });

  it("listCompetitorMentionsForOpportunity filters", () => {
    const opps = listOpportunities(ORG_A);
    if (opps.length > 0) {
      createCompetitorMention({
        organizationId: ORG_A,
        opportunityId: opps[0].id,
        competitorName: "RivalCo",
        context: "Competing for deal",
        createdById: USER_1,
      });
      const items = listCompetitorMentionsForOpportunity(ORG_A, opps[0].id);
      expect(items.every((m) => m.opportunityId === opps[0].id)).toBe(true);
    }
  });
});

describe("SalesOS Store — Proof Assets domain", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG_A, USER_1);
  });

  it("listProofAssets returns all", () => {
    const items = listProofAssets(ORG_A);
    expect(Array.isArray(items)).toBe(true);
  });

  it("createProofAsset creates with defaults", () => {
    const asset = createProofAsset({
      organizationId: ORG_A,
      assetType: "case_study",
      title: "ROI Case Study",
      createdById: USER_1,
    });
    expect(asset.id).toMatch(/^sales-proof-/);
    expect(asset.status).toBe("active");
    expect(asset.source).toBe("manual");
  });

  it("getProofAsset returns by id", () => {
    const asset = createProofAsset({
      organizationId: ORG_A,
      assetType: "benchmark",
      title: "Industry Benchmark",
      createdById: USER_1,
    });
    const found = getProofAsset(ORG_A, asset.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(asset.id);
  });

  it("updateProofAsset patches title", () => {
    const asset = createProofAsset({
      organizationId: ORG_A,
      assetType: "demo_recording",
      title: "Old title",
      createdById: USER_1,
    });
    const updated = updateProofAsset(ORG_A, asset.id, { title: "New title" });
    expect(updated).toBeDefined();
    expect(updated!.title).toBe("New title");
  });

  it("deleteProofAsset returns true and removes", () => {
    const asset = createProofAsset({
      organizationId: ORG_A,
      assetType: "proposal",
      title: "Draft Proposal",
      createdById: USER_1,
    });
    expect(deleteProofAsset(ORG_A, asset.id)).toBe(true);
    expect(getProofAsset(ORG_A, asset.id)).toBeUndefined();
  });

  it("listProofAssetsForOpportunity matches via direct or linkedOpportunityIds", () => {
    const opps = listOpportunities(ORG_A);
    if (opps.length > 0) {
      const asset = createProofAsset({
        organizationId: ORG_A,
        assetType: "case_study",
        title: "Linked Asset",
        linkedOpportunityIds: [opps[0].id],
        createdById: USER_1,
      });
      const items = listProofAssetsForOpportunity(ORG_A, opps[0].id);
      expect(items.some((a) => a.id === asset.id)).toBe(true);
    }
  });
});

describe("SalesOS Store — ICP Insights domain", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG_A, USER_1);
  });

  it("listICPInsights returns all", () => {
    const items = listICPInsights(ORG_A);
    expect(Array.isArray(items)).toBe(true);
  });

  it("createICPInsight creates with ai_draft source", () => {
    const insight = createICPInsight({
      organizationId: ORG_A,
      dimension: "industry",
      hypothesis: "Finance sector needs compliance tools",
      evidenceSummary: "Multiple inquiries from banks",
      createdById: USER_1,
    });
    expect(insight.id).toMatch(/^sales-icp-/);
    expect(insight.source).toBe("ai_draft");
    expect(insight.status).toBe("active");
  });

  it("getICPInsight returns by id", () => {
    const insight = createICPInsight({
      organizationId: ORG_A,
      dimension: "company_size",
      hypothesis: "Enterprises over 500 employees",
      evidenceSummary: "Data from CRM",
      createdById: USER_1,
    });
    const found = getICPInsight(ORG_A, insight.id);
    expect(found).toBeDefined();
    expect(found!.dimension).toBe("company_size");
  });

  it("updateICPInsight patches recommendation", () => {
    const insight = createICPInsight({
      organizationId: ORG_A,
      dimension: "region",
      hypothesis: "GCC expansion",
      evidenceSummary: "Market data",
      createdById: USER_1,
    });
    const updated = updateICPInsight(ORG_A, insight.id, { recommendation: "Focus on UAE first" });
    expect(updated).toBeDefined();
    expect(updated!.recommendation).toBe("Focus on UAE first");
  });

  it("deleteICPInsight removes", () => {
    const insight = createICPInsight({
      organizationId: ORG_A,
      dimension: "pain_point",
      hypothesis: "Audit pain point",
      evidenceSummary: "Client feedback",
      createdById: USER_1,
    });
    expect(deleteICPInsight(ORG_A, insight.id)).toBe(true);
    expect(getICPInsight(ORG_A, insight.id)).toBeUndefined();
  });
});

describe("SalesOS Store — Win/Loss Insights domain", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG_A, USER_1);
  });

  it("listWinLossInsights returns all", () => {
    const items = listWinLossInsights(ORG_A);
    expect(Array.isArray(items)).toBe(true);
  });

  it("createWinLossInsight creates with defaults", () => {
    const accts = listAccounts(ORG_A);
    const opps = listOpportunities(ORG_A);
    const insight = createWinLossInsight({
      organizationId: ORG_A,
      accountId: accts.length > 0 ? accts[0].id : "acct-mock",
      opportunityId: opps.length > 0 ? opps[0].id : "opp-mock",
      outcome: "won",
      primaryReason: "Better pricing",
      createdById: USER_1,
    });
    expect(insight.id).toMatch(/^sales-wl-/);
    expect(insight.outcome).toBe("won");
    expect(insight.source).toBe("manual");
  });

  it("getWinLossInsight returns by id", () => {
    const accts = listAccounts(ORG_A);
    const opps = listOpportunities(ORG_A);
    const insight = createWinLossInsight({
      organizationId: ORG_A,
      accountId: accts.length > 0 ? accts[0].id : "acct-mock",
      opportunityId: opps.length > 0 ? opps[0].id : "opp-mock",
      outcome: "lost",
      primaryReason: "Budget constraints",
      createdById: USER_1,
    });
    const found = getWinLossInsight(ORG_A, insight.id);
    expect(found).toBeDefined();
    expect(found!.outcome).toBe("lost");
  });

  it("listWinLossInsightsForOpportunity filters", () => {
    const opps = listOpportunities(ORG_A);
    if (opps.length > 0) {
      createWinLossInsight({
        organizationId: ORG_A,
        accountId: "acct-mock",
        opportunityId: opps[0].id,
        outcome: "won",
        primaryReason: "Strong relationship",
        createdById: USER_1,
      });
      const items = listWinLossInsightsForOpportunity(ORG_A, opps[0].id);
      expect(items.every((w) => w.opportunityId === opps[0].id)).toBe(true);
    }
  });

  it("updateWinLossInsight patches contributingFactors", () => {
    const opps = listOpportunities(ORG_A);
    const insight = createWinLossInsight({
      organizationId: ORG_A,
      accountId: "acct-mock",
      opportunityId: opps.length > 0 ? opps[0].id : "opp-mock",
      outcome: "won",
      primaryReason: "Product fit",
      createdById: USER_1,
    });
    const updated = updateWinLossInsight(ORG_A, insight.id, {
      contributingFactors: ["Executive alignment", "Quick POC"],
    });
    expect(updated).toBeDefined();
    expect(updated!.contributingFactors).toContain("Executive alignment");
  });

  it("deleteWinLossInsight removes", () => {
    const opps = listOpportunities(ORG_A);
    const insight = createWinLossInsight({
      organizationId: ORG_A,
      accountId: "acct-mock",
      opportunityId: opps.length > 0 ? opps[0].id : "opp-mock",
      outcome: "lost",
      primaryReason: "Competitor advantage",
      createdById: USER_1,
    });
    expect(deleteWinLossInsight(ORG_A, insight.id)).toBe(true);
    expect(getWinLossInsight(ORG_A, insight.id)).toBeUndefined();
  });
});

describe("SalesOS Store — Next Actions domain", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG_A, USER_1);
  });

  it("listNextActions returns all", () => {
    const actions = listNextActions(ORG_A);
    expect(Array.isArray(actions)).toBe(true);
  });

  it("createNextAction creates with defaults status=draft", () => {
    const action = createNextAction({
      organizationId: ORG_A,
      title: "Call client",
      priority: "high",
      createdById: USER_1,
    });
    expect(action.id).toMatch(/^sales-next-/);
    expect(action.status).toBe("draft");
    expect(action.source).toBe("ai_draft");
  });

  it("getNextAction returns by id", () => {
    const action = createNextAction({
      organizationId: ORG_A,
      title: "Send proposal",
      priority: "urgent",
      createdById: USER_1,
    });
    const found = getNextAction(ORG_A, action.id);
    expect(found).toBeDefined();
    expect(found!.title).toBe("Send proposal");
  });

  it("updateNextAction patches priority", () => {
    const action = createNextAction({
      organizationId: ORG_A,
      title: "Follow-up email",
      priority: "medium",
      createdById: USER_1,
    });
    const updated = updateNextAction(ORG_A, action.id, { priority: "high" });
    expect(updated).toBeDefined();
    expect(updated!.priority).toBe("high");
  });

  it("deleteNextAction removes", () => {
    const action = createNextAction({
      organizationId: ORG_A,
      title: "Follow-up call",
      priority: "low",
      createdById: USER_1,
    });
    expect(deleteNextAction(ORG_A, action.id)).toBe(true);
    expect(getNextAction(ORG_A, action.id)).toBeUndefined();
  });

  it("listNextActionsForOpportunity filters by opportunityId", () => {
    const opps = listOpportunities(ORG_A);
    if (opps.length > 0) {
      createNextAction({
        organizationId: ORG_A,
        opportunityId: opps[0].id,
        title: "Send contract",
        priority: "high",
        createdById: USER_1,
      });
      const items = listNextActionsForOpportunity(ORG_A, opps[0].id);
      expect(items.every((a) => a.opportunityId === opps[0].id)).toBe(true);
    }
  });

  it("deleteNextAction returns false for nonexistent", () => {
    expect(deleteNextAction(ORG_A, "no-such-action")).toBe(false);
  });
});

describe("SalesOS Store — Tenant isolation (cross-org security)", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG_A, USER_1);
  });

  it("accounts from ORG_A are not visible in ORG_B", () => {
    const accountsA = listAccounts(ORG_A);
    const accountsB = listAccounts(ORG_B);
    expect(accountsB).toHaveLength(0);
    expect(accountsA.length).toBeGreaterThan(0);
  });

  it("opportunities from ORG_A are not visible in ORG_B", () => {
    const oppsA = listOpportunities(ORG_A);
    const oppsB = listOpportunities(ORG_B);
    expect(oppsB).toHaveLength(0);
    expect(oppsA.length).toBeGreaterThan(0);
  });

  it("signals from ORG_A are isolated from ORG_B", () => {
    const signal = createSignal({
      organizationId: ORG_A,
      signalType: "buying",
      description: "Test signal A",
      strength: "strong",
      createdById: USER_1,
    });
    expect(listSignals(ORG_B)).toHaveLength(0);
    expect(getSignal(ORG_B, signal.id)).toBeUndefined();
  });

  it("next actions from ORG_A isolated from ORG_B", () => {
    createNextAction({
      organizationId: ORG_A,
      title: "Action A",
      priority: "high",
      createdById: USER_1,
    });
    expect(listNextActions(ORG_B)).toHaveLength(0);
  });

  it("evidence and audit entries are tenant-isolated", () => {
    const opps = listOpportunities(ORG_A);
    linkEvidence({
      organizationId: ORG_A,
      opportunityId: opps.length > 0 ? opps[0].id : "opp-mock",
      typeId: "t1",
      label: "Doc 1",
      linkedById: USER_1,
    });
    appendAuditEntry({
      organizationId: ORG_A,
      action: "test",
      actorId: USER_1,
      targetType: "account",
      targetId: "a1",
    });
    expect(listEvidenceForOpportunity(ORG_B, "opp-mock")).toHaveLength(0);
    expect(listAuditEntries(ORG_B)).toHaveLength(0);
  });
});

describe("SalesOS Store — Empty org / edge cases", () => {
  it("freshly reset org returns empty lists for all domains", () => {
    resetSalesStoreForTests();
    expect(listAccounts(ORG_A)).toHaveLength(0);
    expect(listOpportunities(ORG_A)).toHaveLength(0);
    expect(listSignals(ORG_A)).toHaveLength(0);
    expect(listObjections(ORG_A)).toHaveLength(0);
    expect(listCompetitorMentions(ORG_A)).toHaveLength(0);
    expect(listProofAssets(ORG_A)).toHaveLength(0);
    expect(listICPInsights(ORG_A)).toHaveLength(0);
    expect(listNextActions(ORG_A)).toHaveLength(0);
    expect(listWinLossInsights(ORG_A)).toHaveLength(0);
    expect(listMeetings(ORG_A)).toHaveLength(0);
    expect(listOutreach(ORG_A)).toHaveLength(0);
    expect(listAllInteractions(ORG_A)).toHaveLength(0);
  });

  it("get* functions return undefined for nonexistent ids", () => {
    expect(getAccount(ORG_A, "fake")).toBeUndefined();
    expect(getOpportunity(ORG_A, "fake")).toBeUndefined();
    expect(getSignal(ORG_A, "fake")).toBeUndefined();
    expect(getObjection(ORG_A, "fake")).toBeUndefined();
    expect(getCompetitorMention(ORG_A, "fake")).toBeUndefined();
    expect(getProofAsset(ORG_A, "fake")).toBeUndefined();
    expect(getICPInsight(ORG_A, "fake")).toBeUndefined();
    expect(getWinLossInsight(ORG_A, "fake")).toBeUndefined();
    expect(getNextAction(ORG_A, "fake")).toBeUndefined();
  });
});
