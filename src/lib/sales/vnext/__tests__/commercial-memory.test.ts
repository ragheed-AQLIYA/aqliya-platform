import { beforeEach, describe, expect, it } from "@jest/globals";

import {
  extractCompetitorsFromInteractions,
  extractDecisionCriteriaFromInteractions,
  extractObjectionsFromInteractions,
  extractSignalsFromInteractions,
  extractWinLossFromInteractions,
  getCompetitorMentions,
  getTopObjections,
  getTopSignals,
  getWinLossPatterns,
  buildCommercialMemorySnapshot,
} from "../commercial-memory";

import type {
  SalesCompetitorMention,
  SalesInteractionLog,
  SalesObjection,
  SalesOpportunity,
  SalesSignal,
  SalesWinLossInsight,
} from "../../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ORG = "org-cm-test";

function interaction(
  overrides: Partial<SalesInteractionLog> = {},
): SalesInteractionLog {
  return {
    id: "int-1",
    organizationId: ORG,
    accountId: "acct-1",
    type: "meeting",
    summary: "",
    loggedById: "user-1",
    loggedAt: "2026-07-01T00:00:00Z",
    ...overrides,
  };
}

function objection(overrides: Partial<SalesObjection> = {}): SalesObjection {
  return {
    id: "obj-1",
    organizationId: ORG,
    category: "budget",
    description: "No budget allocated",
    createdById: "user-1",
    createdAt: "2026-07-01T00:00:00Z",
    updatedAt: "2026-07-01T00:00:00Z",
    status: "active",
    source: "manual",
    ...overrides,
  };
}

function signal(overrides: Partial<SalesSignal> = {}): SalesSignal {
  return {
    id: "sig-1",
    organizationId: ORG,
    signalType: "buying",
    description: "Executive sponsor identified",
    strength: "strong",
    createdById: "user-1",
    createdAt: "2026-07-01T00:00:00Z",
    updatedAt: "2026-07-01T00:00:00Z",
    status: "active",
    source: "manual",
    ...overrides,
  };
}

function competitorMention(
  overrides: Partial<SalesCompetitorMention> = {},
): SalesCompetitorMention {
  return {
    id: "comp-1",
    organizationId: ORG,
    competitorName: "SAP",
    context: "Customer evaluating SAP",
    threatLevel: "high",
    createdById: "user-1",
    createdAt: "2026-07-01T00:00:00Z",
    updatedAt: "2026-07-01T00:00:00Z",
    status: "active",
    source: "manual",
    ...overrides,
  };
}

function opportunity(
  overrides: Partial<SalesOpportunity> = {},
): SalesOpportunity {
  return {
    id: "opp-1",
    organizationId: ORG,
    accountId: "acct-1",
    name: "Test Opp",
    stage: "Discovery",
    ownerId: "user-1",
    createdById: "user-1",
    ...overrides,
  };
}

function winLossHelper(
  overrides: Partial<SalesWinLossInsight> = {},
): SalesWinLossInsight {
  return {
    id: "wl-1",
    organizationId: ORG,
    accountId: "acct-1",
    opportunityId: "opp-1",
    outcome: "lost",
    primaryReason: "Budget freeze",
    createdById: "user-1",
    createdAt: "2026-07-01T00:00:00Z",
    updatedAt: "2026-07-01T00:00:00Z",
    status: "active",
    source: "seed",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("commercial-memory – common utilities", () => {
  it("matchKeywords returns true when any keyword is present", async () => {
    const { matchKeywords } = await import("../commercial-memory/common");
    expect(matchKeywords("We discussed the budget", ["budget", "roi"])).toBe(true);
    expect(matchKeywords("Nothing relevant here", ["budget", "roi"])).toBe(false);
  });

  it("normalizeText lowercases input", async () => {
    const { normalizeText } = await import("../commercial-memory/common");
    expect(normalizeText("Hello World")).toBe("hello world");
    expect(normalizeText("")).toBe("");
  });
});

describe("commercial-memory – extractors", () => {
  describe("extractObjectionsFromInteractions", () => {
    it("detects objection categories from interaction summaries", () => {
      const interactions = [
        interaction({ id: "i1", summary: "Customer mentioned budget constraints" }),
        interaction({ id: "i2", summary: "Security questionnaire required" }),
        interaction({ id: "i3", summary: "CFO sign-off needed for approval" }),
      ];
      const result = extractObjectionsFromInteractions(interactions);
      expect(result.get("budget")).toBe(1);
      expect(result.get("security")).toBe(1);
      expect(result.get("approval")).toBe(1);
      expect(result.size).toBe(3);
    });

    it("increments count when same objection appears multiple times", () => {
      const interactions = [
        interaction({ id: "i1", summary: "budget is frozen this quarter" }),
        interaction({ id: "i2", summary: "pricing discussion about ROI" }),
        interaction({ id: "i3", summary: "still waiting for budget approval" }),
      ];
      const result = extractObjectionsFromInteractions(interactions);
      expect(result.get("budget")).toBe(3);
    });

    it("returns empty map for no keyword matches", () => {
      const interactions = [
        interaction({ id: "i1", summary: "General catch-up with no objections" }),
      ];
      const result = extractObjectionsFromInteractions(interactions);
      expect(result.size).toBe(0);
    });
  });

  describe("extractSignalsFromInteractions", () => {
    it("detects signals with strength metadata", () => {
      const interactions = [
        interaction({ id: "i1", summary: "Customer confirmed renewal intent" }),
        interaction({ id: "i2", summary: "Executive sponsor intro received" }),
        interaction({ id: "i3", summary: "Contract redlines received" }),
      ];
      const result = extractSignalsFromInteractions(interactions);
      expect(result.get("renewal_intent")).toEqual({ count: 1, strength: "strong" });
      expect(result.get("executive_sponsor")).toEqual({ count: 1, strength: "strong" });
      expect(result.get("contract_momentum")).toEqual({ count: 1, strength: "moderate" });
    });

    it("upgrades strength to strong when any match is strong", () => {
      const interactions = [
        interaction({ id: "i1", summary: "Contract redlines received" }),
        interaction({ id: "i2", summary: "Pilot kickoff completed" }),
      ];
      const result = extractSignalsFromInteractions(interactions);
      expect(result.get("contract_momentum")!.strength).toBe("moderate");
      expect(result.get("pilot_progress")!.strength).toBe("strong");
    });

    it("returns empty map for no signal matches", () => {
      const interactions = [
        interaction({ id: "i1", summary: "Routine check-in" }),
      ];
      const result = extractSignalsFromInteractions(interactions);
      expect(result.size).toBe(0);
    });
  });

  describe("extractCompetitorsFromInteractions", () => {
    it("detects known competitor names", () => {
      const interactions = [
        interaction({ id: "i1", summary: "Customer comparing SAP and Oracle" }),
        interaction({ id: "i2", summary: "They are using Salesforce currently" }),
      ];
      const result = extractCompetitorsFromInteractions(interactions);
      expect(result.get("SAP")!.count).toBe(1);
      expect(result.get("Oracle")!.count).toBe(1);
      expect(result.get("Salesforce")!.count).toBe(1);
    });

    it("detects general competitive mentions", () => {
      const interactions = [
        interaction({ id: "i1", summary: "Competitive landscape review" }),
        interaction({ id: "i2", summary: "Incumbent vendor issue" }),
      ];
      const result = extractCompetitorsFromInteractions(interactions);
      expect(result.get("Competitive landscape")!.count).toBe(1);
      expect(result.get("Competitive mention")!.count).toBe(1);
    });

    it("captures context (first 120 chars), accountId, and opportunityId", () => {
      const interactions = [
        interaction({
          id: "i1",
          summary: "SAP is the main competitor in this deal",
          accountId: "acct-99",
          opportunityId: "opp-99",
        }),
      ];
      const result = extractCompetitorsFromInteractions(interactions);
      const entry = result.get("SAP")!;
      expect(entry.context).toBe("SAP is the main competitor in this deal");
      expect(entry.accountId).toBe("acct-99");
      expect(entry.opportunityId).toBe("opp-99");
    });
  });

  describe("extractDecisionCriteriaFromInteractions", () => {
    it("detects decision criteria categories", () => {
      const interactions = [
        interaction({ id: "i1", summary: "Governance requirements discussed" }),
        interaction({ id: "i2", summary: "Security questionnaire submitted" }),
      ];
      const result = extractDecisionCriteriaFromInteractions(interactions);
      expect(result.get("governance")).toBe(1);
      expect(result.get("security_review")).toBe(1);
    });

    it("returns empty map when no criteria keywords match", () => {
      const result = extractDecisionCriteriaFromInteractions([
        interaction({ id: "i1", summary: "Casual update call" }),
      ]);
      expect(result.size).toBe(0);
    });
  });

  describe("extractWinLossFromInteractions", () => {
    it("extracts loss patterns from loss debrief summaries", () => {
      const interactions = [
        interaction({ id: "i1", summary: "Loss debrief with customer" }),
        interaction({ id: "i2", summary: "Budget freeze caused the loss" }),
      ];
      const result = extractWinLossFromInteractions(interactions);
      expect(result).toHaveLength(2);
      expect(result[0].outcome).toBe("lost");
      expect(result[0].source).toBe("interaction");
    });

    it("returns empty array when no loss signals found", () => {
      const interactions = [
        interaction({ id: "i1", summary: "Great meeting, moving forward" }),
      ];
      const result = extractWinLossFromInteractions(interactions);
      expect(result).toHaveLength(0);
    });
  });
});

describe("commercial-memory – aggregators", () => {
  describe("getTopObjections", () => {
    it("merges stored objections with interaction-derived objections, sorted by count descending", () => {
      const objections: SalesObjection[] = [
        objection({ id: "o1", category: "budget" }),
        objection({ id: "o2", category: "budget" }),
        objection({ id: "o3", category: "timing" }),
      ];
      const interactions = [
        interaction({ id: "i1", summary: "Security questionnaire received" }),
        interaction({ id: "i2", summary: "Budget is frozen" }),
      ];
      const result = getTopObjections({ objections, interactions });
      expect(result[0].label).toBe("budget");
      expect(result[0].count).toBe(3); // 2 stored + 1 extracted
      expect(result[1].label).toBe("timing");
      expect(result[1].count).toBe(1);
      expect(result[2].label).toBe("security");
      expect(result[2].count).toBe(1);
    });

    it("respects limit parameter", () => {
      const objections: SalesObjection[] = [
        objection({ id: "o1", category: "budget" }),
        objection({ id: "o2", category: "timing" }),
        objection({ id: "o3", category: "security" }),
      ];
      const result = getTopObjections({ objections, interactions: [], limit: 2 });
      expect(result).toHaveLength(2);
    });

    it("returns empty array when no objections or interactions", () => {
      const result = getTopObjections({ objections: [], interactions: [] });
      expect(result).toHaveLength(0);
    });
  });

  describe("getTopSignals", () => {
    it("merges stored signals (weighted by strength) with interaction-derived signals", () => {
      const signals: SalesSignal[] = [
        signal({ id: "s1", signalType: "buying", strength: "strong" }),
        signal({ id: "s2", signalType: "timing", strength: "moderate" }),
      ];
      const interactions = [
        interaction({ id: "i1", summary: "Renewal intent confirmed" }),
      ];
      const result = getTopSignals({ signals, interactions });
      // buying: strong stored = weight 2
      // timing: moderate stored = weight 1
      // renewal_intent from interaction: strong => count 1 * 2 = weight 2
      expect(result.find((r) => r.label === "buying")!.count).toBe(2);
      expect(result.find((r) => r.label === "renewal_intent")!.count).toBe(2);
      expect(result.find((r) => r.label === "timing")!.count).toBe(1);
    });

    it("respects limit parameter", () => {
      const signals: SalesSignal[] = [
        signal({ id: "s1", signalType: "buying", strength: "strong" }),
        signal({ id: "s2", signalType: "timing", strength: "moderate" }),
        signal({ id: "s3", signalType: "budget", strength: "weak" }),
      ];
      const result = getTopSignals({ signals, interactions: [], limit: 2 });
      expect(result).toHaveLength(2);
    });
  });

  describe("getCompetitorMentions", () => {
    it("merges stored competitor mentions with interaction-derived mentions", () => {
      const competitors: SalesCompetitorMention[] = [
        competitorMention({ id: "c1", competitorName: "SAP", threatLevel: "high" }),
      ];
      const interactions = [
        interaction({ id: "i1", summary: "Oracle is also being evaluated", accountId: "acct-2" }),
      ];
      const result = getCompetitorMentions({ competitors, interactions });
      expect(result.find((c) => c.name === "SAP")!.count).toBe(1);
      expect(result.find((c) => c.name === "SAP")!.source).toBe("stored");
      expect(result.find((c) => c.name === "Oracle")!.count).toBe(1);
      expect(result.find((c) => c.name === "Oracle")!.source).toBe("interaction");
    });

    it("respects limit parameter", () => {
      const competitors: SalesCompetitorMention[] = [
        competitorMention({ id: "c1", competitorName: "SAP" }),
        competitorMention({ id: "c2", competitorName: "Oracle" }),
        competitorMention({ id: "c3", competitorName: "Microsoft" }),
      ];
      const result = getCompetitorMentions({ competitors, interactions: [], limit: 2 });
      expect(result.length).toBeLessThanOrEqual(2);
    });
  });

  describe("getWinLossPatterns", () => {
    it("merges stored win/loss insights with opportunity and interaction data", () => {
      const storedWinLoss: SalesWinLossInsight[] = [
        winLossHelper({ id: "wl1", outcome: "lost", primaryReason: "Budget freeze" }),
        winLossHelper({ id: "wl2", outcome: "lost", primaryReason: "Budget freeze" }),
      ];
      const opportunities: SalesOpportunity[] = [
        opportunity({
          id: "opp-99",
          stage: "ClosedWon",
          winLossReason: "Executive alignment",
        }),
      ];
      const interactions = [
        interaction({ id: "i1", summary: "Loss debrief: customer went with incumbent" }),
      ];
      const result = getWinLossPatterns({ winLoss: storedWinLoss, opportunities, interactions });
      // Budget freeze: 2 stored
      // Executive alignment: 1 from opportunity (ClosedWon → won)
      // loss_debrief: 1 from interaction
      expect(result.length).toBeGreaterThanOrEqual(3);
      const budgetFreeze = result.find((r) => r.reason === "Budget freeze");
      expect(budgetFreeze).toBeDefined();
      expect(budgetFreeze!.count).toBe(2);
    });

    it("skips non-closed opportunities and those without winLossReason", () => {
      const opportunities: SalesOpportunity[] = [
        opportunity({ id: "opp-1", stage: "Discovery", winLossReason: "N/A" }),
        opportunity({ id: "opp-2", stage: "ClosedWon" }), // no winLossReason
      ];
      const result = getWinLossPatterns({
        winLoss: [],
        opportunities,
        interactions: [],
      });
      expect(result).toHaveLength(0);
    });
  });
});

describe("commercial-memory – snapshot builder", () => {
  it("buildCommercialMemorySnapshot returns the expected structure with counts", () => {
    const snapshot = buildCommercialMemorySnapshot({
      organizationId: ORG,
      interactions: [
        interaction({ id: "i1", summary: "Budget constraints and security review" }),
        interaction({ id: "i2", summary: "SAP competitive mention" }),
      ],
      opportunities: [],
      objections: [
        objection({ id: "o1", category: "budget" }),
      ],
      signals: [],
      competitors: [],
      winLoss: [],
    });

    expect(snapshot.organizationId).toBe(ORG);
    expect(typeof snapshot.objectionCount).toBe("number");
    expect(typeof snapshot.signalCount).toBe("number");
    expect(typeof snapshot.competitorCount).toBe("number");
    expect(typeof snapshot.winLossCount).toBe("number");
    expect(typeof snapshot.decisionCriteriaCount).toBe("number");
    expect(Array.isArray(snapshot.patterns)).toBe(true);
    expect(Array.isArray(snapshot.topObjections)).toBe(true);
    expect(Array.isArray(snapshot.topSignals)).toBe(true);
    expect(Array.isArray(snapshot.competitors)).toBe(true);
    expect(Array.isArray(snapshot.winLossPatterns)).toBe(true);
    expect(Array.isArray(snapshot.decisionCriteria)).toBe(true);
  });

  it("filters input data by organizationId", () => {
    const otherOrg = "org-other";
    const snapshot = buildCommercialMemorySnapshot({
      organizationId: ORG,
      interactions: [
        interaction({ id: "i1", summary: "budget concern", organizationId: ORG }),
        interaction({ id: "i2", summary: "budget concern", organizationId: otherOrg }),
      ],
      opportunities: [],
      objections: [],
      signals: [],
      competitors: [],
      winLoss: [],
    });

    // Only the org-matched interaction should contribute
    expect(snapshot.objectionCount).toBe(1);
  });

  it("generates patterns for recurring items (count >= 2)", () => {
    const snapshot = buildCommercialMemorySnapshot({
      organizationId: ORG,
      interactions: [
        interaction({ id: "i1", summary: "Budget freeze and budget constraints" }),
        interaction({ id: "i2", summary: "Budget constraints again" }),
        interaction({ id: "i3", summary: "Loss debrief with customer" }),
        interaction({ id: "i4", summary: "SAP competitive mention" }),
        interaction({ id: "i5", summary: "SAP mentioned again" }),
      ],
      opportunities: [],
      objections: [
        objection({ id: "o1", category: "budget" }),
      ],
      signals: [],
      competitors: [],
      winLoss: [],
    });

    // objection "budget": 1 stored + 3 interactions = 4 >= 2 => pattern
    // loss from interaction i3 => loss theme pattern
    // SAP count = 2 => competitor pattern
    expect(snapshot.patterns.length).toBeGreaterThanOrEqual(3);

    const objectionPattern = snapshot.patterns.find(
      (p) => p.patternType === "recurring_objection",
    );
    expect(objectionPattern).toBeDefined();
    expect(objectionPattern!.count).toBeGreaterThanOrEqual(2);

    const lossPattern = snapshot.patterns.find(
      (p) => p.patternType === "loss_theme",
    );
    expect(lossPattern).toBeDefined();
  });

  it("handles empty input gracefully", () => {
    const snapshot = buildCommercialMemorySnapshot({
      organizationId: ORG,
      interactions: [],
      opportunities: [],
      objections: [],
      signals: [],
      competitors: [],
      winLoss: [],
    });

    expect(snapshot.organizationId).toBe(ORG);
    expect(snapshot.objectionCount).toBe(0);
    expect(snapshot.signalCount).toBe(0);
    expect(snapshot.competitorCount).toBe(0);
    expect(snapshot.winLossCount).toBe(0);
    expect(snapshot.decisionCriteriaCount).toBe(0);
    expect(snapshot.patterns).toHaveLength(0);
    expect(snapshot.topObjections).toHaveLength(0);
    expect(snapshot.topSignals).toHaveLength(0);
    expect(snapshot.competitors).toHaveLength(0);
    expect(snapshot.winLossPatterns).toHaveLength(0);
    expect(snapshot.decisionCriteria).toHaveLength(0);
  });

  it("builds strong signal pattern when signal count >= 2", () => {
    const snapshot = buildCommercialMemorySnapshot({
      organizationId: ORG,
      interactions: [
        interaction({ id: "i1", summary: "Renewal intent confirmed" }),
        interaction({ id: "i2", summary: "Executive sponsor intro received" }),
      ],
      opportunities: [],
      objections: [],
      signals: [],
      competitors: [],
      winLoss: [],
    });

    const strongSignalPattern = snapshot.patterns.find(
      (p) => p.patternType === "strong_signal",
    );
    expect(strongSignalPattern).toBeDefined();
    expect(strongSignalPattern!.label).toContain("Multiple buying signals");
  });

  it("assigns confidence scores based on count thresholds", () => {
    const snapshot = buildCommercialMemorySnapshot({
      organizationId: ORG,
      interactions: [
        interaction({ id: "i1", summary: "Budget constraints" }),
        interaction({ id: "i2", summary: "Budget constraints again" }),
        interaction({ id: "i3", summary: "Budget constraints again and again" }),
        interaction({ id: "i4", summary: "Budget constraints again and again and again" }),
      ],
      opportunities: [],
      objections: [
        objection({ id: "o1", category: "budget" }),
      ],
      signals: [],
      competitors: [],
      winLoss: [],
    });

    const pattern = snapshot.patterns.find(
      (p) => p.patternType === "recurring_objection",
    );
    expect(pattern).toBeDefined();
    // count = 1 stored + 4 extracted = 5, confidence = min(0.9, 0.5 + 5 * 0.1) = 0.9
    expect(pattern!.confidence).toBeGreaterThanOrEqual(0.8);
  });
});
