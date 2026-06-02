// @ts-nocheck
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  buildCommercialMemorySnapshot,
  getCompetitorMentions,
  getTopObjections,
  getTopSignals,
  getWinLossPatterns,
} from "../vnext/commercial-memory";
import {
  salesBuildCommercialMemorySnapshot,
  salesGetCompetitorMentions,
  salesGetTopObjections,
  salesGetTopSignals,
  salesGetWinLossPatterns,
} from "../services/commercial-memory-service";
import { ensureSalesSeed, resetSalesStoreForTests } from "../store";
import type {
  SalesCompetitorMention,
  SalesInteractionLog,
  SalesObjection,
  SalesOpportunity,
  SalesSignal,
  SalesWinLossInsight,
} from "../types";

const ORG = "org-salesos-v01";
const OWNER = "user-seed-001";

const BASE_INTERACTION: SalesInteractionLog = {
  id: "int-1",
  organizationId: ORG,
  accountId: "acct-1",
  type: "meeting",
  summary: "",
  loggedById: OWNER,
  loggedAt: "2026-05-01T10:00:00.000Z",
};

describe("commercial-memory rules", () => {
  it("extracts objections from interaction keywords", () => {
    const objections: SalesObjection[] = [];
    const interactions: SalesInteractionLog[] = [
      { ...BASE_INTERACTION, id: "i1", summary: "CFO raised budget and ROI concerns" },
      { ...BASE_INTERACTION, id: "i2", summary: "Security questionnaire and governance review" },
      { ...BASE_INTERACTION, id: "i3", summary: "Budget freeze mentioned again" },
    ];

    const top = getTopObjections({ objections, interactions });
    expect(top.some((o) => o.label === "budget")).toBe(true);
    expect(top.some((o) => o.label === "security")).toBe(true);
    expect(top.find((o) => o.label === "budget")?.count).toBeGreaterThanOrEqual(2);
  });

  it("merges stored objections with interaction-derived counts", () => {
    const objections: SalesObjection[] = [
      {
        id: "obj-1",
        organizationId: ORG,
        category: "budget",
        description: "Stored budget objection",
        createdById: OWNER,
        createdAt: "2026-05-01T10:00:00.000Z",
        updatedAt: "2026-05-01T10:00:00.000Z",
        status: "active",
        source: "manual",
      },
    ];
    const interactions: SalesInteractionLog[] = [
      { ...BASE_INTERACTION, summary: "Pricing and budget discussion" },
    ];

    const top = getTopObjections({ objections, interactions });
    expect(top[0].label).toBe("budget");
    expect(top[0].count).toBeGreaterThanOrEqual(2);
    expect(top[0].source).toBe("stored");
  });

  it("extracts buying signals from interactions", () => {
    const signals: SalesSignal[] = [];
    const interactions: SalesInteractionLog[] = [
      { ...BASE_INTERACTION, id: "s1", summary: "Renewal terms workshop with VP" },
      { ...BASE_INTERACTION, id: "s2", summary: "Executive sponsor intro meeting" },
      { ...BASE_INTERACTION, id: "s3", summary: "Pilot kickoff scheduled" },
    ];

    const top = getTopSignals({ signals, interactions });
    expect(top.length).toBeGreaterThan(0);
    expect(top.some((s) => s.count >= 2)).toBe(true);
  });

  it("merges stored and interaction competitor mentions", () => {
    const competitors: SalesCompetitorMention[] = [
      {
        id: "comp-1",
        organizationId: ORG,
        competitorName: "Legacy GRC Suite",
        context: "Incumbent in RFP",
        createdById: OWNER,
        createdAt: "2026-05-01T10:00:00.000Z",
        updatedAt: "2026-05-01T10:00:00.000Z",
        status: "active",
        source: "manual",
        threatLevel: "medium",
      },
    ];
    const interactions: SalesInteractionLog[] = [
      { ...BASE_INTERACTION, summary: "Competitive landscape noted in workshop" },
      { ...BASE_INTERACTION, id: "c2", summary: "Legacy GRC Suite referenced again" },
    ];

    const mentions = getCompetitorMentions({ competitors, interactions });
    expect(mentions.some((m) => m.name === "Legacy GRC Suite")).toBe(true);
    expect(mentions.some((m) => m.name === "Competitive landscape")).toBe(true);
  });

  it("aggregates win/loss patterns from stored, opportunity, and interaction sources", () => {
    const winLoss: SalesWinLossInsight[] = [
      {
        id: "wl-1",
        organizationId: ORG,
        opportunityId: "opp-1",
        outcome: "lost",
        primaryReason: "budget_freeze",
        contributingFactors: ["timing"],
        createdById: OWNER,
        createdAt: "2026-05-01T10:00:00.000Z",
        updatedAt: "2026-05-01T10:00:00.000Z",
        status: "active",
        source: "manual",
      },
    ];
    const opportunities: SalesOpportunity[] = [
      {
        id: "opp-2",
        organizationId: ORG,
        accountId: "acct-1",
        name: "Closed deal",
        stage: "Closed Lost",
        winLossReason: "no_executive_sponsor",
        ownerId: OWNER,
        createdById: OWNER,
      },
    ];
    const interactions: SalesInteractionLog[] = [
      { ...BASE_INTERACTION, summary: "Loss debrief — budget frozen" },
    ];

    const patterns = getWinLossPatterns({ winLoss, opportunities, interactions });
    expect(patterns.some((p) => p.reason === "budget_freeze")).toBe(true);
    expect(patterns.some((p) => p.reason === "no_executive_sponsor")).toBe(true);
    expect(
      patterns.some((p) => p.reason === "budget_freeze" && p.count > 1),
    ).toBe(true);
  });

  it("builds snapshot with repeated patterns", () => {
    const snapshot = buildCommercialMemorySnapshot({
      organizationId: ORG,
      interactions: [
        { ...BASE_INTERACTION, id: "p1", summary: "Budget and ROI pushback" },
        { ...BASE_INTERACTION, id: "p2", summary: "Budget approval delayed" },
        { ...BASE_INTERACTION, id: "p3", summary: "Governance requirements and security questionnaire" },
        { ...BASE_INTERACTION, id: "p4", summary: "Success criteria drafted for pilot" },
        { ...BASE_INTERACTION, id: "p5", summary: "Pilot success criteria review" },
      ],
      opportunities: [],
      objections: [
        {
          id: "obj-budget",
          organizationId: ORG,
          category: "budget",
          description: "ROI proof",
          createdById: OWNER,
          createdAt: "2026-05-01T10:00:00.000Z",
          updatedAt: "2026-05-01T10:00:00.000Z",
          status: "active",
          source: "manual",
        },
      ],
      signals: [
        {
          id: "sig-1",
          organizationId: ORG,
          signalType: "timing",
          description: "Renewal intent",
          strength: "strong",
          createdById: OWNER,
          createdAt: "2026-05-01T10:00:00.000Z",
          updatedAt: "2026-05-01T10:00:00.000Z",
          status: "draft",
          source: "ai_draft",
        },
      ],
      competitors: [],
      winLoss: [],
    });

    expect(snapshot.organizationId).toBe(ORG);
    expect(snapshot.topObjections.length).toBeGreaterThan(0);
    expect(snapshot.decisionCriteria.length).toBeGreaterThan(0);
    expect(snapshot.patterns.some((p) => p.patternType === "recurring_objection")).toBe(
      true,
    );
  });
});

describe("commercial-memory service (seed-backed)", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG, OWNER);
  });

  it("builds org snapshot from store", () => {
    const snapshot = salesBuildCommercialMemorySnapshot(ORG);
    expect(snapshot.organizationId).toBe(ORG);
    expect(snapshot.topObjections.length).toBeGreaterThan(0);
    expect(snapshot.competitors.length).toBeGreaterThan(0);
    expect(snapshot.winLossPatterns.length).toBeGreaterThan(0);
  });

  it("exposes top objections via service", () => {
    const top = salesGetTopObjections(ORG);
    expect(top.some((o) => o.label === "budget" || o.label === "timing")).toBe(true);
  });

  it("exposes top signals via service", () => {
    const top = salesGetTopSignals(ORG);
    expect(top.length).toBeGreaterThan(0);
  });

  it("exposes competitor mentions via service", () => {
    const mentions = salesGetCompetitorMentions(ORG);
    expect(mentions.some((m) => m.name === "Legacy GRC Suite")).toBe(true);
  });

  it("exposes win/loss patterns via service", () => {
    const patterns = salesGetWinLossPatterns(ORG);
    expect(patterns.some((p) => p.outcome === "lost")).toBe(true);
  });
});
