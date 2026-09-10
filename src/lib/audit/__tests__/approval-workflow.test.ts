import { describe, expect, it, beforeEach, jest } from "@jest/globals";

// ─── Reviewer Signoff Chain Tests ───

import { buildReviewerSignoffChain, type SignoffChainInput } from "../reviewer-signoff-chain";

function baseInput(overrides: Partial<SignoffChainInput> = {}): SignoffChainInput {
  return {
    engagementStatus: "draft",
    hasTrialBalance: false,
    hasStatements: false,
    openReviewComments: 0,
    approvalRecords: [],
    ...overrides,
  };
}

describe("Approval Workflow — Reviewer Signoff Chain", () => {
  it("all stages pending when no work done", () => {
    const chain = buildReviewerSignoffChain(baseInput());
    expect(chain.stages).toHaveLength(4);
    expect(chain.stages[0].status).toBe("pending");
    expect(chain.stages[1].status).toBe("blocked");
    expect(chain.stages[2].status).toBe("blocked");
    expect(chain.stages[3].status).toBe("blocked");
    expect(chain.overallProgressPct).toBe(0);
    expect(chain.blocked).toBe(true);
  });

  it("fieldwork in_progress when trial balance exists but no statements", () => {
    const chain = buildReviewerSignoffChain(baseInput({ hasTrialBalance: true }));
    expect(chain.stages[0].status).toBe("in_progress");
    expect(chain.stages[0].detailAr).toContain("يلزم");
    expect(chain.currentStageKey).toBe("fieldwork");
  });

  it("fieldwork complete when trial balance and statements exist", () => {
    const chain = buildReviewerSignoffChain(baseInput({ hasTrialBalance: true, hasStatements: true }));
    expect(chain.stages[0].status).toBe("complete");
    expect(chain.stages[0].detailAr).toContain("جاهزة");
  });

  it("technical review blocked when fieldwork incomplete", () => {
    const chain = buildReviewerSignoffChain(baseInput({ hasTrialBalance: false, hasStatements: false }));
    expect(chain.stages[1].status).toBe("blocked");
  });

  it("technical review pending when fieldwork complete but no reviewer approval", () => {
    const chain = buildReviewerSignoffChain(baseInput({ hasTrialBalance: true, hasStatements: true }));
    expect(chain.stages[1].status).toBe("pending");
  });

  it("technical review in_progress when open review comments exist", () => {
    const chain = buildReviewerSignoffChain(
      baseInput({ hasTrialBalance: true, hasStatements: true, openReviewComments: 3 }),
    );
    expect(chain.stages[1].status).toBe("in_progress");
    expect(chain.stages[1].detailAr).toContain("3 تعليق");
  });

  it("technical review complete when reviewer approves with no open comments", () => {
    const chain = buildReviewerSignoffChain(
      baseInput({
        hasTrialBalance: true,
        hasStatements: true,
        openReviewComments: 0,
        approvalRecords: [
          { approverRole: "reviewer", approverName: "Review Man", action: "approved", createdAt: "2026-01-01T00:00:00.000Z" },
        ],
      }),
    );
    expect(chain.stages[1].status).toBe("complete");
    expect(chain.stages[1].completedBy).toBe("Review Man");
  });

  it("technical review accepts admin as reviewer role", () => {
    const chain = buildReviewerSignoffChain(
      baseInput({
        hasTrialBalance: true,
        hasStatements: true,
        approvalRecords: [
          { approverRole: "admin", approverName: "Admin User", action: "approved", createdAt: "2026-01-01T00:00:00.000Z" },
        ],
      }),
    );
    expect(chain.stages[1].status).toBe("complete");
  });

  it("partner signoff blocked when technical review incomplete", () => {
    const chain = buildReviewerSignoffChain(baseInput({ hasTrialBalance: true, hasStatements: true }));
    expect(chain.stages[2].status).toBe("blocked");
  });

  it("partner signoff pending when technical review complete but no partner approval", () => {
    const chain = buildReviewerSignoffChain(
      baseInput({
        hasTrialBalance: true,
        hasStatements: true,
        approvalRecords: [
          { approverRole: "reviewer", approverName: "Review Man", action: "approved", createdAt: "2026-01-01T00:00:00.000Z" },
        ],
      }),
    );
    expect(chain.stages[2].status).toBe("pending");
  });

  it("partner signoff complete when partner approves", () => {
    const chain = buildReviewerSignoffChain(
      baseInput({
        hasTrialBalance: true,
        hasStatements: true,
        approvalRecords: [
          { approverRole: "reviewer", approverName: "Review Man", action: "approved", createdAt: "2026-01-01T00:00:00.000Z" },
          { approverRole: "partner", approverName: "Partner X", action: "approved", createdAt: "2026-01-02T00:00:00.000Z" },
        ],
      }),
    );
    expect(chain.stages[2].status).toBe("complete");
    expect(chain.stages[2].completedBy).toBe("Partner X");
  });

  it("publication blocked when partner not approved", () => {
    const chain = buildReviewerSignoffChain(
      baseInput({
        hasTrialBalance: true,
        hasStatements: true,
        approvalRecords: [
          { approverRole: "reviewer", approverName: "R", action: "approved", createdAt: "2026-01-01T00:00:00.000Z" },
        ],
      }),
    );
    expect(chain.stages[3].status).toBe("blocked");
  });

  it("publication in_progress when partner approved but not ready_for_approval or published", () => {
    const chain = buildReviewerSignoffChain(
      baseInput({
        engagementStatus: "under_review",
        hasTrialBalance: true,
        hasStatements: true,
        approvalRecords: [
          { approverRole: "reviewer", approverName: "R", action: "approved", createdAt: "2026-01-01T00:00:00.000Z" },
          { approverRole: "partner", approverName: "P", action: "approved", createdAt: "2026-01-02T00:00:00.000Z" },
        ],
      }),
    );
    expect(chain.stages[3].status).toBe("in_progress");
  });

  it("publication complete when engagement is ready_for_approval", () => {
    const chain = buildReviewerSignoffChain(
      baseInput({
        engagementStatus: "ready_for_approval",
        hasTrialBalance: true,
        hasStatements: true,
        approvalRecords: [
          { approverRole: "reviewer", approverName: "R", action: "approved", createdAt: "2026-01-01T00:00:00.000Z" },
          { approverRole: "partner", approverName: "P", action: "approved", createdAt: "2026-01-02T00:00:00.000Z" },
        ],
      }),
    );
    expect(chain.stages[3].status).toBe("complete");
  });

  it("publication complete when engagement is published", () => {
    const chain = buildReviewerSignoffChain(
      baseInput({
        engagementStatus: "published",
        hasTrialBalance: true,
        hasStatements: true,
        approvalRecords: [
          { approverRole: "reviewer", approverName: "R", action: "approved", createdAt: "2026-01-01T00:00:00.000Z" },
          { approverRole: "partner", approverName: "P", action: "approved", createdAt: "2026-01-02T00:00:00.000Z" },
        ],
      }),
    );
    expect(chain.stages[3].status).toBe("complete");
    expect(chain.overallProgressPct).toBe(100);
    expect(chain.blocked).toBe(false);
  });

  it("uses latest partner approval when multiple exist", () => {
    const chain = buildReviewerSignoffChain(
      baseInput({
        hasTrialBalance: true,
        hasStatements: true,
        approvalRecords: [
          { approverRole: "partner", approverName: "Partner Old", action: "approved", createdAt: "2026-01-01T00:00:00.000Z" },
          { approverRole: "reviewer", approverName: "R", action: "approved", createdAt: "2026-01-01T00:00:00.000Z" },
          { approverRole: "partner", approverName: "Partner New", action: "approved", createdAt: "2026-01-03T00:00:00.000Z" },
        ],
      }),
    );
    expect(chain.stages[2].completedBy).toBe("Partner New");
  });

  it("rejected approvals are ignored", () => {
    const chain = buildReviewerSignoffChain(
      baseInput({
        hasTrialBalance: true,
        hasStatements: true,
        approvalRecords: [
          { approverRole: "reviewer", approverName: "R", action: "rejected", createdAt: "2026-01-01T00:00:00.000Z" },
          { approverRole: "partner", approverName: "P", action: "rejected", createdAt: "2026-01-02T00:00:00.000Z" },
        ],
      }),
    );
    expect(chain.stages[1].status).toBe("pending");
    expect(chain.stages[2].status).toBe("blocked");
  });

  it("overallProgressPct calculates correctly for partial completion", () => {
    const chain = buildReviewerSignoffChain(baseInput({ hasTrialBalance: true, hasStatements: true }));
    const completeCount = chain.stages.filter((s) => s.status === "complete").length;
    expect(chain.overallProgressPct).toBe(Math.round((completeCount / 4) * 100));
  });

  it("currentStageKey is null when all stages complete", () => {
    const chain = buildReviewerSignoffChain(
      baseInput({
        engagementStatus: "published",
        hasTrialBalance: true,
        hasStatements: true,
        approvalRecords: [
          { approverRole: "reviewer", approverName: "R", action: "approved", createdAt: "2026-01-01T00:00:00.000Z" },
          { approverRole: "partner", approverName: "P", action: "approved", createdAt: "2026-01-02T00:00:00.000Z" },
        ],
      }),
    );
    expect(chain.currentStageKey).toBeNull();
  });

  it("blocked flag is true when downstream stages are blocked by incomplete fieldwork", () => {
    const chain = buildReviewerSignoffChain(baseInput({ hasTrialBalance: false }));
    expect(chain.stages[0].status).toBe("pending");
    // downstream stages (technical_review, partner_signoff, publication) are all "blocked"
    // blocked = stages.some(s => s.status === "blocked" && s.key !== "fieldwork")
    expect(chain.blocked).toBe(true);
  });

  it("disclaimerAr is always present", () => {
    const chain = buildReviewerSignoffChain(baseInput());
    expect(chain.disclaimerAr.length).toBeGreaterThan(0);
  });

  it("stage labelsAr are set for all stages", () => {
    const chain = buildReviewerSignoffChain(baseInput());
    for (const stage of chain.stages) {
      expect(stage.labelAr.length).toBeGreaterThan(0);
      expect(stage.detailAr.length).toBeGreaterThan(0);
    }
  });

  it("requiredRole is set for all stages", () => {
    const chain = buildReviewerSignoffChain(baseInput());
    expect(chain.stages[0].requiredRole).toBe("operator");
    expect(chain.stages[1].requiredRole).toBe("reviewer");
    expect(chain.stages[2].requiredRole).toBe("partner");
    expect(chain.stages[3].requiredRole).toBe("partner");
  });

  it("completedAt is set on complete stages when approval records exist", () => {
    const chain = buildReviewerSignoffChain(
      baseInput({
        engagementStatus: "published",
        hasTrialBalance: true,
        hasStatements: true,
        approvalRecords: [
          { approverRole: "reviewer", approverName: "R", action: "approved", createdAt: "2026-01-01T00:00:00.000Z" },
          { approverRole: "partner", approverName: "P", action: "approved", createdAt: "2026-01-02T00:00:00.000Z" },
        ],
      }),
    );
    expect(chain.stages[1].completedAt).toBe("2026-01-01T00:00:00.000Z");
    expect(chain.stages[2].completedAt).toBe("2026-01-02T00:00:00.000Z");
  });

  it("case-insensitive role matching for reviewer", () => {
    const chain = buildReviewerSignoffChain(
      baseInput({
        hasTrialBalance: true,
        hasStatements: true,
        approvalRecords: [
          { approverRole: "REVIEWER", approverName: "Upper", action: "approved", createdAt: "2026-01-01T00:00:00.000Z" },
        ],
      }),
    );
    expect(chain.stages[1].status).toBe("complete");
  });

  it("case-insensitive role matching for partner", () => {
    const chain = buildReviewerSignoffChain(
      baseInput({
        hasTrialBalance: true,
        hasStatements: true,
        approvalRecords: [
          { approverRole: "reviewer", approverName: "R", action: "approved", createdAt: "2026-01-01T00:00:00.000Z" },
          { approverRole: "PARTNER", approverName: "UpperP", action: "approved", createdAt: "2026-01-02T00:00:00.000Z" },
        ],
      }),
    );
    expect(chain.stages[2].status).toBe("complete");
  });
});

// ─── Review Notes Engine — SLA Edge Cases ───

jest.mock("@/lib/audit/services", () => ({
  recordAuditEvent: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    reviewNote: {
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    reviewNoteSLA: {
      create: jest.fn(),
      update: jest.fn(),
    },
    reviewNoteEscalation: {
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

import { reviewNotesEngine } from "../review-notes-engine";

const mockedPrisma = jest.requireMock("@/lib/prisma").prisma;
const ACTOR = { actorId: "u-1", actorName: "Auditor", actorRole: "manager", organizationId: "org-1" };
const NOW = new Date("2026-07-03T12:00:00.000Z");

function mockNote(overrides: Record<string, unknown> = {}) {
  return {
    id: "note-1",
    engagementId: "eng-1",
    reviewNoteNumber: "RN-1",
    targetType: "statement",
    targetId: "fs-1",
    reviewStage: "execution",
    priority: "high",
    status: "raised",
    comment: "Test comment",
    raiserId: "u-2",
    raiserName: "Manager",
    assignedToId: null,
    assignedAt: null,
    slaTargetHours: null,
    responseDescription: null,
    respondedAt: null,
    evidenceRef: null,
    reviewerConclusion: null,
    closureComment: null,
    closedById: null,
    closedAt: null,
    raisedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
    slaConfig: null,
    escalations: [],
    ...overrides,
  };
}

describe("Approval Workflow — Review Notes SLA Edge Cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(NOW);
    mockedPrisma.reviewNote.count.mockResolvedValue(0);
    mockedPrisma.reviewNote.create.mockImplementation(({ data }: any) =>
      Promise.resolve(mockNote({ ...data, id: "note-1", reviewNoteNumber: "RN-1" })),
    );
    mockedPrisma.reviewNote.findUnique.mockResolvedValue(mockNote());
    mockedPrisma.reviewNoteSLA.create.mockResolvedValue({ id: "sla-1", reviewNoteId: "note-1", slaTargetHours: 24 });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("critical priority gets 4h response SLA", async () => {
    await reviewNotesEngine.create(ACTOR, {
      engagementId: "eng-1",
      targetType: "statement",
      targetId: "fs-1",
      reviewStage: "execution",
      priority: "critical",
      comment: "Urgent",
    });
    expect(mockedPrisma.reviewNoteSLA.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ slaTargetHours: 4 }) }),
    );
  });

  it("low priority gets 168h response SLA", async () => {
    await reviewNotesEngine.create(ACTOR, {
      engagementId: "eng-1",
      targetType: "statement",
      targetId: "fs-1",
      reviewStage: "execution",
      priority: "low",
      comment: "Minor",
    });
    expect(mockedPrisma.reviewNoteSLA.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ slaTargetHours: 168 }) }),
    );
  });

  it("medium priority gets 72h response SLA", async () => {
    await reviewNotesEngine.create(ACTOR, {
      engagementId: "eng-1",
      targetType: "statement",
      targetId: "fs-1",
      reviewStage: "execution",
      priority: "medium",
      comment: "Normal",
    });
    expect(mockedPrisma.reviewNoteSLA.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ slaTargetHours: 72 }) }),
    );
  });

  it("unknown priority defaults to medium SLA", async () => {
    await reviewNotesEngine.create(ACTOR, {
      engagementId: "eng-1",
      targetType: "statement",
      targetId: "fs-1",
      reviewStage: "execution",
      priority: "unknown",
      comment: "Unknown",
    });
    expect(mockedPrisma.reviewNoteSLA.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ slaTargetHours: 72 }) }),
    );
  });

  it("auto-numbers review notes correctly", async () => {
    mockedPrisma.reviewNote.count.mockResolvedValue(5);
    await reviewNotesEngine.create(ACTOR, {
      engagementId: "eng-1",
      targetType: "statement",
      targetId: "fs-1",
      reviewStage: "execution",
      priority: "high",
      comment: "Test",
    });
    expect(mockedPrisma.reviewNote.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ reviewNoteNumber: "RN-6" }) }),
    );
  });

  it("creates note with assigned status when assignedToId provided", async () => {
    await reviewNotesEngine.create(ACTOR, {
      engagementId: "eng-1",
      targetType: "statement",
      targetId: "fs-1",
      reviewStage: "execution",
      priority: "high",
      comment: "Test",
      assignedToId: "user-3",
    });
    expect(mockedPrisma.reviewNote.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "assigned" }) }),
    );
  });

  it("creates note with raised status when no assignee", async () => {
    await reviewNotesEngine.create(ACTOR, {
      engagementId: "eng-1",
      targetType: "statement",
      targetId: "fs-1",
      reviewStage: "execution",
      priority: "high",
      comment: "Test",
    });
    expect(mockedPrisma.reviewNote.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "raised" }) }),
    );
  });

  it("addEvidence transitions to evidenced status", async () => {
    mockedPrisma.reviewNote.update.mockResolvedValue(mockNote({ status: "evidenced" }));
    const result = await reviewNotesEngine.addEvidence(ACTOR, "note-1", "eng-1", { fileRef: "abc" });
    expect(result.status).toBe("evidenced");
  });

  it("review with re_open resets response fields", async () => {
    mockedPrisma.reviewNote.update.mockResolvedValue(mockNote({ status: "assigned", responseDescription: null }));
    const result = await reviewNotesEngine.review(ACTOR, "note-1", "eng-1", "re_open", "Needs more work");
    expect(result.status).toBe("assigned");
    const updateCall = mockedPrisma.reviewNote.update.mock.calls[0]?.[0];
    expect(updateCall?.data?.responseDescription).toBeNull();
  });

  it("review with satisfactory closes with closureComment", async () => {
    mockedPrisma.reviewNote.update.mockResolvedValue(mockNote({ status: "closed" }));
    await reviewNotesEngine.review(ACTOR, "note-1", "eng-1", "satisfactory", "All good");
    const updateCall = mockedPrisma.reviewNote.update.mock.calls[0]?.[0];
    expect(updateCall?.data?.closureComment).toBe("All good");
    expect(updateCall?.data?.closedById).toBe("u-1");
  });

  it("resolveEscalation updates escalation record", async () => {
    mockedPrisma.reviewNoteEscalation.update.mockResolvedValue({ id: "esc-1", reviewNoteId: "note-1", resolution: "Fixed" });
    const result = await reviewNotesEngine.resolveEscalation(ACTOR, "esc-1", "eng-1", "Fixed");
    expect(result.resolution).toBe("Fixed");
  });

  it("list returns notes ordered by priority desc then createdAt asc", async () => {
    mockedPrisma.reviewNote.findMany.mockResolvedValue([mockNote({ priority: "critical" }), mockNote({ priority: "low" })]);
    const results = await reviewNotesEngine.list("eng-1", { priority: "critical" });
    expect(results).toHaveLength(2);
    expect(mockedPrisma.reviewNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ priority: "critical" }),
        orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      }),
    );
  });

  it("list filters by assignedToId", async () => {
    mockedPrisma.reviewNote.findMany.mockResolvedValue([]);
    await reviewNotesEngine.list("eng-1", { assignedToId: "user-5" });
    expect(mockedPrisma.reviewNote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ assignedToId: "user-5" }),
      }),
    );
  });

  it("SLA metrics: healthy when elapsed < 80% of target", async () => {
    const oneHourAgo = new Date(NOW.getTime() - 1 * 3_600_000);
    mockedPrisma.reviewNote.findMany.mockResolvedValue([
      mockNote({ id: "n1", raisedAt: oneHourAgo, slaConfig: { slaTargetHours: 24 } }),
    ]);
    const metrics = await reviewNotesEngine.getSLAMetrics("eng-1");
    expect(metrics.healthy).toBe(1);
    expect(metrics.breached).toBe(0);
    expect(metrics.warning).toBe(0);
  });

  it("SLA metrics: warning when elapsed >= 80% of target", async () => {
    const twentyHoursAgo = new Date(NOW.getTime() - 20 * 3_600_000);
    mockedPrisma.reviewNote.findMany.mockResolvedValue([
      mockNote({ id: "n1", raisedAt: twentyHoursAgo, slaConfig: { slaTargetHours: 24 } }),
    ]);
    const metrics = await reviewNotesEngine.getSLAMetrics("eng-1");
    expect(metrics.warning).toBe(1);
    expect(metrics.breached).toBe(0);
  });

  it("SLA metrics: breached when elapsed >= target", async () => {
    const thirtyHoursAgo = new Date(NOW.getTime() - 30 * 3_600_000);
    mockedPrisma.reviewNote.findMany.mockResolvedValue([
      mockNote({ id: "n1", raisedAt: thirtyHoursAgo, slaConfig: { slaTargetHours: 24 } }),
    ]);
    const metrics = await reviewNotesEngine.getSLAMetrics("eng-1");
    expect(metrics.breached).toBe(1);
    expect(metrics.healthy).toBe(0);
  });

  it("SLA metrics: averageSlaRatio calculated correctly", async () => {
    const sixHoursAgo = new Date(NOW.getTime() - 6 * 3_600_000);
    const twelveHoursAgo = new Date(NOW.getTime() - 12 * 3_600_000);
    mockedPrisma.reviewNote.findMany.mockResolvedValue([
      mockNote({ id: "n1", raisedAt: sixHoursAgo, slaConfig: { slaTargetHours: 24 } }),
      mockNote({ id: "n2", raisedAt: twelveHoursAgo, slaConfig: { slaTargetHours: 24 } }),
    ]);
    const metrics = await reviewNotesEngine.getSLAMetrics("eng-1");
    // ratio1 = 6/24 = 0.25, ratio2 = 12/24 = 0.5, avg = 0.375
    expect(metrics.averageSlaRatio).toBe(0.38);
  });

  it("SLA metrics: handles notes without slaConfig", async () => {
    mockedPrisma.reviewNote.findMany.mockResolvedValue([
      mockNote({ id: "n1", slaConfig: null }),
    ]);
    const metrics = await reviewNotesEngine.getSLAMetrics("eng-1");
    expect(metrics.total).toBe(1);
    expect(metrics.healthy).toBe(0);
    expect(metrics.breached).toBe(0);
    expect(metrics.warning).toBe(0);
    expect(metrics.averageSlaRatio).toBe(0);
  });

  it("SLA metrics: handles empty notes list", async () => {
    mockedPrisma.reviewNote.findMany.mockResolvedValue([]);
    const metrics = await reviewNotesEngine.getSLAMetrics("eng-1");
    expect(metrics.total).toBe(0);
    expect(metrics.averageSlaRatio).toBe(0);
  });
});

