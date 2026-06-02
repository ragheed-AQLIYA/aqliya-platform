// @ts-nocheck
import { describe, expect, it } from "@jest/globals";
import {
  assemblePilotHandoffPack,
  buildPilotHandoffChecklist,
  buildPilotHandoffExportHtml,
} from "../pilot-handoff-pack";

const BASE_DEAL = {
  id: "deal-1",
  title: "Pilot ACME",
  status: "open",
  amount: 50000,
  currency: "SAR",
  metadata: {
    conversionMemo: {
      draft: "Pilot succeeded.",
      status: "submitted",
      pilotCriteria: "3 workshops; NPS >= 8",
      evidenceRefs: ["link-1"],
      decidedAt: null,
      updatedById: "user-1",
      updatedAt: "2026-06-01T10:00:00.000Z",
      submittedAt: "2026-06-01T11:00:00.000Z",
    },
    reviewDecisions: [
      {
        id: "rev-1",
        decision: "approved",
        actorId: "user-1",
        actorName: "Reviewer",
        reason: "Evidence sufficient for pilot handoff",
        createdAt: "2026-06-01T12:00:00.000Z",
        stageSlug: "pilot",
      },
    ],
  },
  account: { id: "acct-1", name: "ACME Corp" },
  stage: { name: "Pilot", slug: "pilot" },
};

const EVIDENCE_LINKS = [
  {
    id: "link-1",
    evidenceId: "ev-1",
    evidenceSource: "core",
    label: "Workshop notes",
    evidenceType: "document",
    title: "Workshop notes",
    type: "document",
    resolved: true,
    createdAt: new Date("2026-06-01T09:00:00.000Z"),
    createdById: "user-1",
  },
];

const ACCOUNT_METADATA = {
  icpScore: {
    fitScore: 82,
    band: "strong",
    segment: "ICP-1 — Audit firms",
    agentGenerated: true,
    reviewed: true,
    reasoning: ["Strong industry fit"],
  },
};

describe("SalesOS pilot handoff pack (PR-19)", () => {
  it("assembles pack from deal metadata and account ICP", () => {
    const pack = assemblePilotHandoffPack({
      deal: BASE_DEAL,
      accountMetadata: ACCOUNT_METADATA,
      evidenceLinks: EVIDENCE_LINKS,
    });

    expect(pack.deal.title).toBe("Pilot ACME");
    expect(pack.conversionMemo?.status).toBe("submitted");
    expect(pack.evidenceLinks).toHaveLength(1);
    expect(pack.reviewDecisions[0]?.decision).toBe("approved");
    expect(pack.icpAssessment.score?.fitScore).toBe(82);
    expect(pack.checklist.length).toBeGreaterThan(0);
  });

  it("marks checklist incomplete when memo missing", () => {
    const pack = assemblePilotHandoffPack({
      deal: { ...BASE_DEAL, metadata: {} },
      accountMetadata: {},
      evidenceLinks: [],
    });

    const memoItem = pack.checklist.find((c) => c.id === "conversion-memo-draft");
    expect(memoItem?.checked).toBe(false);
  });

  it("builds export HTML with checklist and memo", () => {
    const pack = assemblePilotHandoffPack({
      deal: BASE_DEAL,
      accountMetadata: ACCOUNT_METADATA,
      evidenceLinks: EVIDENCE_LINKS,
    });

    const html = buildPilotHandoffExportHtml(pack);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Pilot ACME");
    expect(html).toContain("Pilot succeeded.");
    expect(html).toContain("قائمة تحقق التسليم");
  });

  it("marks ICP review na when not agent-generated", () => {
    const pack = assemblePilotHandoffPack({
      deal: BASE_DEAL,
      accountMetadata: {
        icpScore: { fitScore: 60, band: "moderate", agentGenerated: false },
      },
      evidenceLinks: EVIDENCE_LINKS,
    });

    const icpReview = buildPilotHandoffChecklist({
      ...pack,
      checklist: [],
    }).find((c) => c.id === "icp-reviewed");
    expect(icpReview?.checked).toBe(false);
  });
});
