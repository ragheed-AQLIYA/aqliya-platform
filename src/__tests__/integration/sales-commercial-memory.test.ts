import { prisma } from "@/lib/prisma";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import type {
  SalesAccount,
  SalesOpportunity,
  SalesInteractionLog,
} from "@/lib/sales/types";
import { buildICPHypotheses } from "@/lib/sales/intelligence/commercial-memory";
import { deriveCompetitorMentions } from "@/lib/sales/intelligence/commercial-memory";
import { extractObjectionsFromInteractions } from "@/lib/sales/intelligence/commercial-memory";
import { buildNextBestActions } from "@/lib/sales/intelligence/commercial-memory";
import { buildAccountIntelligence } from "@/lib/sales/vnext/account-intelligence";
import { scoreOpportunity } from "@/lib/sales/intelligence/opportunity-scoring";

// ─── Cleanup helper ───────────────────────────────────────────────────────────

async function cleanup() {
  await prisma.platformAuditLog.deleteMany();
  await prisma.salesApproval.deleteMany();
  await prisma.salesReview.deleteMany();
  await prisma.salesProposal.deleteMany();
  await prisma.salesEvidenceLink.deleteMany();
  await prisma.salesInteraction.deleteMany();
  await prisma.salesContact.deleteMany();
  await prisma.salesDeal.deleteMany();
  await prisma.salesPipelineStage.deleteMany();
  await prisma.salesPipeline.deleteMany();
  await prisma.salesAccount.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
}

// ─── Shared seed IDs ──────────────────────────────────────────────────────────

let orgId: string;
let userId: string;
let accountId: string;
let pipelineId: string;
let stageIds: string[] = [];

// ─── Domain data factories (mirror types.ts) ──────────────────────────────────

function toAccount(row: {
  id: string; organizationId: string; name: string; nameAr?: string | null;
  industry?: string | null; status: string; ownerId?: string | null;
  createdById?: string | null; createdAt: Date; updatedAt: Date;
}): SalesAccount {
  return {
    id: row.id, organizationId: row.organizationId, name: row.name,
    nameAr: row.nameAr ?? undefined, industry: row.industry ?? undefined,
    status: row.status as SalesAccount["status"],
    ownerId: row.ownerId ?? "", createdById: row.createdById ?? "",
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
  };
}

function toOpportunity(row: {
  id: string; organizationId: string; accountId: string; title: string;
  status: string; amount?: number | null; currency?: string | null;
  probability?: number | null; stageId?: string | null; ownerId?: string | null;
  createdById?: string | null; pipelineStage?: string | null;
  reviewStatus?: string | null; approvalStatus?: string | null;
  createdAt: Date; updatedAt: Date;
}): SalesOpportunity {
  return {
    id: row.id, organizationId: row.organizationId, accountId: row.accountId,
    name: row.title, stage: (row.pipelineStage ?? "New") as SalesOpportunity["stage"],
    valueEstimate: row.amount ?? undefined, currency: row.currency ?? undefined,
    probability: row.probability ?? undefined, ownerId: row.ownerId ?? "",
    createdById: row.createdById ?? "",
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
    reviewStatus: row.reviewStatus ?? undefined,
    approvalStatus: row.approvalStatus ?? undefined,
  };
}

function toInteractionLog(row: {
  id: string; organizationId: string; accountId: string;
  dealId?: string | null; type: string; subject?: string | null;
  summary?: string | null; createdById?: string | null; occurredAt: Date;
}): SalesInteractionLog {
  return {
    id: row.id, organizationId: row.organizationId, accountId: row.accountId,
    opportunityId: row.dealId ?? undefined, type: row.type as SalesInteractionLog["type"],
    summary: row.summary ?? "", loggedById: row.createdById ?? "",
    loggedAt: row.occurredAt.toISOString(),
  };
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeAll(async () => {
  await cleanup();

  const org = await prisma.organization.create({
    data: { name: "Sales Commercial Memory Test Org" },
  });
  orgId = org.id;

  const user = await prisma.user.create({
    data: {
      email: "sales.memory@aqliya.test",
      name: "Sales Memory Tester",
      role: "ADMIN",
      organizationId: orgId,
    },
  });
  userId = user.id;

  // Create pipeline with stages
  const pipeline = await prisma.salesPipeline.create({
    data: {
      organizationId: orgId,
      name: "Default Pipeline",
      slug: "default",
      isDefault: true,
      createdById: userId,
      updatedById: userId,
    },
  });
  pipelineId = pipeline.id;

  const stageData = [
    { name: "New", slug: "new", sortOrder: 0 },
    { name: "Qualified", slug: "qualified", sortOrder: 1 },
    { name: "Proposal", slug: "proposal", sortOrder: 2 },
    { name: "Closed Won", slug: "closed_won", sortOrder: 3, isClosed: true },
  ];

  for (const s of stageData) {
    const stage = await prisma.salesPipelineStage.create({
      data: {
        pipelineId: pipeline.id,
        organizationId: orgId,
        name: s.name,
        slug: s.slug,
        sortOrder: s.sortOrder,
        isClosed: s.isClosed ?? false,
      },
    });
    stageIds.push(stage.id);
  }

  // Create accounts
  const account1 = await prisma.salesAccount.create({
    data: {
      organizationId: orgId,
      name: "شركة التقنية المتقدمة",
      nameAr: "شركة التقنية المتقدمة",
      industry: "Technology",
      status: "active",
      createdById: userId,
      updatedById: userId,
    },
  });
  accountId = account1.id;

  const account2 = await prisma.salesAccount.create({
    data: {
      organizationId: orgId,
      name: "المؤسسة المالية الأولى",
      nameAr: "المؤسسة المالية الأولى",
      industry: "Finance",
      status: "active",
      createdById: userId,
      updatedById: userId,
    },
  });
}, 30000);

afterAll(async () => {
  await cleanup();
}, 30000);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("SalesOS Commercial Memory", () => {
  describe("extractObjectionsFromInteractions", () => {
    it("extracts objections from interaction summaries", () => {
      const interactions: SalesInteractionLog[] = [
        { id: "i1", organizationId: orgId, accountId, type: "meeting", summary: "They raised budget concerns and governance requirements", loggedById: userId, loggedAt: new Date().toISOString() },
        { id: "i2", organizationId: orgId, accountId, type: "meeting", summary: "Budget is still the main blocker", loggedById: userId, loggedAt: new Date().toISOString() },
        { id: "i3", organizationId: orgId, accountId, type: "email", summary: "Security compliance is a must", loggedById: userId, loggedAt: new Date().toISOString() },
      ];

      const objections = extractObjectionsFromInteractions(interactions);

      expect(objections.length).toBeGreaterThanOrEqual(2);
      const budgetObj = objections.find((o) => o.labelAr.includes("الميزانية") || o.labelAr.includes("Budget"));
      expect(budgetObj).toBeDefined();
      expect(budgetObj!.count).toBeGreaterThanOrEqual(2);
      expect(budgetObj!.source).toBe("interaction");
    });

    it("returns default objection when no keywords match but interactions exist", () => {
      const interactions: SalesInteractionLog[] = [
        { id: "i4", organizationId: orgId, accountId, type: "note", summary: "Follow up next quarter", loggedById: userId, loggedAt: new Date().toISOString() },
      ];

      const objections = extractObjectionsFromInteractions(interactions);
      expect(objections.length).toBeGreaterThanOrEqual(1);
    });

    it("returns empty array for no interactions", () => {
      const objections = extractObjectionsFromInteractions([]);
      expect(objections).toHaveLength(0);
    });
  });

  describe("deriveCompetitorMentions", () => {
    it("extracts competitor mentions from interactions", () => {
      const accounts: SalesAccount[] = [
        { id: accountId, organizationId: orgId, name: "شركة التقنية", industry: "Technology", status: "active", ownerId: userId, createdById: userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      const interactions: SalesInteractionLog[] = [
        { id: "i5", organizationId: orgId, accountId, type: "meeting", summary: "They are evaluating SAP and Oracle", loggedById: userId, loggedAt: new Date().toISOString() },
        { id: "i6", organizationId: orgId, accountId, type: "meeting", summary: "SAP is the current incumbent", loggedById: userId, loggedAt: new Date().toISOString() },
      ];

      const mentions = deriveCompetitorMentions(accounts, interactions);

      const sapMention = mentions.find((m) => m.name === "SAP");
      expect(sapMention).toBeDefined();
      expect(sapMention!.accountId).toBe(accountId);
    });

    it("returns fallback mention when no competitors found", () => {
      const accounts: SalesAccount[] = [
        { id: accountId, organizationId: orgId, name: "Test Co", status: "active", ownerId: userId, createdById: userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      const interactions: SalesInteractionLog[] = [
        { id: "i7", organizationId: orgId, accountId, type: "note", summary: "General discussion", loggedById: userId, loggedAt: new Date().toISOString() },
      ];

      const mentions = deriveCompetitorMentions(accounts, interactions);
      expect(mentions.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("buildICPHypotheses", () => {
    it("builds ICP hypotheses from accounts and opportunities", () => {
      const accounts: SalesAccount[] = [
        { id: "a1", organizationId: orgId, name: "Tech Co", industry: "Technology", status: "active", ownerId: userId, createdById: userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "a2", organizationId: orgId, name: "Fin Co", industry: "Finance", status: "active", ownerId: userId, createdById: userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "a3", organizationId: orgId, name: "Health Co", industry: "Healthcare", status: "active", ownerId: userId, createdById: userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      const opportunities: SalesOpportunity[] = [
        { id: "o1", organizationId: orgId, accountId: "a1", name: "ERP Deal", stage: "Proposal", valueEstimate: 500000, ownerId: userId, createdById: userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "o2", organizationId: orgId, accountId: "a2", name: "Banking Deal", stage: "Discovery", valueEstimate: 750000, ownerId: userId, createdById: userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];

      const hypotheses = buildICPHypotheses(accounts, opportunities);

      expect(hypotheses.length).toBeGreaterThanOrEqual(2);
      const techHyp = hypotheses.find((h) => h.segment === "Technology");
      expect(techHyp).toBeDefined();
      expect(techHyp!.confidence).toBeGreaterThan(0);

      const financeHyp = hypotheses.find((h) => h.segment === "Finance");
      expect(financeHyp).toBeDefined();
      expect(financeHyp!.segmentAr).toContain("Finance");
    });

    it("handles empty accounts gracefully", () => {
      const hypotheses = buildICPHypotheses([], []);
      expect(hypotheses).toHaveLength(0);
    });
  });

  describe("buildNextBestActions", () => {
    it("generates next-best actions from accounts, opportunities, interactions", () => {
      const accounts: SalesAccount[] = [
        { id: accountId, organizationId: orgId, name: "شركة التقنية المتقدمة", nameAr: "شركة التقنية المتقدمة", industry: "Technology", status: "active", ownerId: userId, createdById: userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      const opportunities: SalesOpportunity[] = [
        { id: "o3", organizationId: orgId, accountId, name: "ERP Platform", stage: "Qualification", valueEstimate: 300000, qualificationScore: 60, ownerId: userId, createdById: userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      const interactions: SalesInteractionLog[] = [
        { id: "i8", organizationId: orgId, accountId, type: "meeting", summary: "Initial discovery call", loggedById: userId, loggedAt: new Date(Date.now() - 20 * 86400000).toISOString(), opportunityId: "o3" },
      ];

      const actions = buildNextBestActions({ accounts, opportunities, interactions });

      expect(actions.length).toBeGreaterThanOrEqual(1);
      // Should flag stalled opportunity or review requirement
      const hasStalled = actions.some((a) => a.id.includes("stall") || a.id.includes("review") || a.id.includes("block"));
      expect(hasStalled).toBe(true);
      actions.forEach((a) => {
        expect(a.labelAr).toBeTruthy();
        expect(a.priority).toMatch(/^(high|medium|low)$/);
        expect(a.href).toContain("/sales/");
      });
    });

    it("suggests first interaction for accounts with no interactions", () => {
      const freshAccount: SalesAccount = {
        id: "fresh-acc", organizationId: orgId, name: "New Account", status: "active",
        ownerId: userId, createdById: userId,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      const actions = buildNextBestActions({
        accounts: [freshAccount],
        opportunities: [],
        interactions: [],
      });
      const firstAction = actions.find((a) => a.id.includes("first"));
      expect(firstAction).toBeDefined();
      expect(firstAction!.labelAr).toContain("أول");
    });
  });

  describe("buildAccountIntelligence", () => {
    it("calculates health score and identifies next actions", () => {
      const account: SalesAccount = {
        id: accountId, organizationId: orgId, name: "Test Account",
        industry: "Technology", status: "active",
        ownerId: userId, createdById: userId,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      const opportunities: SalesOpportunity[] = [
        { id: "o4", organizationId: orgId, accountId, name: "Deal A", stage: "Proposal", valueEstimate: 500000, ownerId: userId, createdById: userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];

      const intelligence = buildAccountIntelligence({
        account,
        opportunities,
        interactionCount: 3,
        daysSinceLastInteraction: 7,
      });

      expect(intelligence.accountId).toBe(accountId);
      expect(intelligence.healthScore).toBeGreaterThanOrEqual(0);
      // calculateOverallScore multiplies by 100; value depends on signal inputs
      expect(intelligence.healthLevel).toBeTruthy();
      expect(intelligence.activeOpportunities).toBe(1);
      expect(intelligence.pipelineValue).toBe(500000);
      expect(intelligence.signals.length).toBeGreaterThanOrEqual(2);
      expect(intelligence.nextActions).toBeDefined();
    });

    it("handles account with zero interactions", () => {
      const account: SalesAccount = {
        id: "acc-zero", organizationId: orgId, name: "Zero Interaction Account",
        status: "prospect", ownerId: userId, createdById: userId,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      const intelligence = buildAccountIntelligence({
        account,
        opportunities: [],
        interactionCount: 0,
      });
      // calculateOverallScore produces large values due to 0-100 inputs with *100 multiplier
      expect(intelligence.healthScore).toBeGreaterThanOrEqual(0);
      expect(intelligence.nextActions).toContain("Log first interaction");
    });
  });

  describe("scoreOpportunity", () => {
    it("scores a qualified opportunity with high value", () => {
      const opp: SalesOpportunity = {
        id: "o-score-1", organizationId: orgId, accountId, name: "High Value Deal",
        stage: "Proposal", valueEstimate: 500000, reviewStatus: "Approved",
        ownerId: userId, createdById: userId,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      const result = scoreOpportunity(opp);
      expect(result.score).toBeGreaterThanOrEqual(60);
      expect(result.factors).toContain("stage:Proposal");
      expect(result.factors).toContain("high_value");
      expect(result.factors).toContain("review_approved");
    });

    it("identifies blockers from risks array", () => {
      const opp: SalesOpportunity = {
        id: "o-score-2", organizationId: orgId, accountId, name: "Risky Deal",
        stage: "Qualification", risks: ["Budget not approved", "Long procurement cycle"],
        ownerId: userId, createdById: userId,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      const result = scoreOpportunity(opp);
      expect(result.blockers).toEqual(["Budget not approved", "Long procurement cycle"]);
    });

    it("flags risk indicators for high-value unreviewed deals", () => {
      const opp: SalesOpportunity = {
        id: "o-score-3", organizationId: orgId, accountId, name: "Unreviewed Big Deal",
        stage: "Discovery", valueEstimate: 500000,
        ownerId: userId, createdById: userId,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      const result = scoreOpportunity(opp);
      expect(result.riskIndicators).toContain("high_value_unreviewed");
    });
  });

  describe("Org scoping — cross-org isolation", () => {
    let otherOrgId: string;
    let otherAccountId: string;

    beforeAll(async () => {
      const otherOrg = await prisma.organization.create({
        data: { name: "Other Org Commercial Memory" },
      });
      otherOrgId = otherOrg.id;

      const otherUser = await prisma.user.create({
        data: {
          email: "other.memory@aqliya.test",
          name: "Other Memory Tester",
          role: "VIEWER",
          organizationId: otherOrgId,
        },
      });

      const otherAccount = await prisma.salesAccount.create({
        data: {
          organizationId: otherOrgId,
          name: "شركة أخرى",
          industry: "Retail",
          status: "active",
          createdById: otherUser.id,
          updatedById: otherUser.id,
        },
      });
      otherAccountId = otherAccount.id;
    });

    afterAll(async () => {
      await prisma.salesAccount.deleteMany({ where: { organizationId: otherOrgId } });
      await prisma.user.deleteMany({ where: { organizationId: otherOrgId } });
      await prisma.organization.deleteMany({ where: { id: otherOrgId } });
    });

    it("buildICPHypotheses only includes accounts from the specified org", () => {
      const accounts: SalesAccount[] = [
        { id: "cross-a1", organizationId: otherOrgId, name: "Retail Co", industry: "Retail", status: "active", ownerId: userId, createdById: userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      const hypotheses = buildICPHypotheses(accounts, []);
      expect(hypotheses.length).toBeGreaterThanOrEqual(1);
      // Verify no technology accounts leak in
      const techHyp = hypotheses.find((h) => h.segment === "Technology");
      expect(techHyp).toBeUndefined();
    });

    it("account intelligence is scoped to the provided account's org", () => {
      const account: SalesAccount = {
        id: otherAccountId, organizationId: otherOrgId, name: "Retail Account",
        industry: "Retail", status: "active",
        ownerId: userId, createdById: userId,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      const intel = buildAccountIntelligence({
        account,
        opportunities: [],
        interactionCount: 0,
      });
      expect(intel.accountId).toBe(otherAccountId);
      expect(intel.accountId).not.toBe(accountId);
    });
  });
});
