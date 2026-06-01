import { describe, expect, it } from "@jest/globals";
import {
  assembleAccountBriefPack,
  buildAccountBriefExportHtml,
} from "../account-brief-pack";

const BASE_ACCOUNT = {
  id: "acct-1",
  name: "ACME Corp",
  status: "active",
  industry: "Technology",
  isDemo: false,
  createdAt: new Date("2026-05-01T10:00:00.000Z"),
  updatedAt: new Date("2026-06-01T10:00:00.000Z"),
  metadata: {
    icpScore: {
      fitScore: 78,
      band: "strong",
      segment: "ICP-1 — Audit firms",
      confidence: 72,
      reasoning: ["Strong industry fit"],
    },
    agentRuns: {
      accountResearch: {
        brief: "# موجز بحث\n\nAcme is a strong fit.",
        sources: [{ type: "account_field", label: "القطاع", value: "Technology" }],
        confidence: 65,
        status: "reviewed",
        generatedAt: "2026-06-01T09:00:00.000Z",
        generatedById: "user-1",
        generatedByName: "Operator",
        reviewedAt: "2026-06-01T10:00:00.000Z",
        reviewedById: "admin-1",
        reviewedByName: "Admin",
      },
    },
    signals: [
      {
        id: "sig-1",
        type: "intent",
        title: "RFP published",
        summary: "Public tender for audit platform",
        severity: "high",
        detectedAt: "2026-05-28T08:00:00.000Z",
        createdAt: "2026-05-28T08:00:00.000Z",
      },
    ],
  },
  deals: [
    {
      id: "deal-1",
      title: "Pilot ACME",
      status: "open",
      amount: 50000,
      currency: "SAR",
      updatedAt: new Date("2026-06-01T11:00:00.000Z"),
      stage: { name: "Pilot" },
    },
  ],
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

describe("SalesOS account brief pack (PR-21c)", () => {
  it("assembles pack from account fields, metadata, signals, and deals", () => {
    const pack = assembleAccountBriefPack({
      account: BASE_ACCOUNT,
      signals: [
        {
          id: "sig-1",
          accountId: "acct-1",
          type: "intent",
          title: "RFP published",
          summary: "Public tender for audit platform",
          severity: "high",
          detectedAt: "2026-05-28T08:00:00.000Z",
          createdAt: "2026-05-28T08:00:00.000Z",
        },
      ],
      evidenceLinks: EVIDENCE_LINKS,
    });

    expect(pack.accountName).toBe("ACME Corp");
    expect(pack.icpAssessment.score?.fitScore).toBe(78);
    expect(pack.research?.status).toBe("reviewed");
    expect(pack.signals).toHaveLength(1);
    expect(pack.deals).toHaveLength(1);
    expect(pack.evidenceCount).toBe(1);
  });

  it("builds export HTML with account fields, ICP, signals, research, and deals", () => {
    const pack = assembleAccountBriefPack({
      account: BASE_ACCOUNT,
      signals: [
        {
          id: "sig-1",
          accountId: "acct-1",
          type: "intent",
          title: "RFP published",
          summary: "Public tender",
          severity: "high",
          detectedAt: "2026-05-28T08:00:00.000Z",
          createdAt: "2026-05-28T08:00:00.000Z",
        },
      ],
      evidenceLinks: EVIDENCE_LINKS,
    });

    const html = buildAccountBriefExportHtml(pack);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("ACME Corp");
    expect(html).toContain("Technology");
    expect(html).toContain("RFP published");
    expect(html).toContain("Acme is a strong fit.");
    expect(html).toContain("Pilot ACME");
    expect(html).toContain("1</strong> دليل مرتبط");
  });

  it("handles missing ICP, research, signals, and deals", () => {
    const pack = assembleAccountBriefPack({
      account: {
        ...BASE_ACCOUNT,
        metadata: {},
        deals: [],
      },
      signals: [],
      evidenceLinks: [],
    });

    expect(pack.icpAssessment.configured).toBe(false);
    expect(pack.research).toBeNull();
    expect(pack.evidenceCount).toBe(0);

    const html = buildAccountBriefExportHtml(pack);
    expect(html).toContain("لا يوجد تقييم ICP");
    expect(html).toContain("لا موجز بحث بعد");
  });
});
