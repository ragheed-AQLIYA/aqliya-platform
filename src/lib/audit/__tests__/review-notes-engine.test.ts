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

const ACTOR = { actorId: "user-1", actorName: "Reviewer", actorRole: "reviewer", organizationId: "org-1" };
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
    comment: "Please expand the cash narrative.",
    raiserId: "user-2",
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

describe("ReviewNotesEngine (L6.6)", () => {
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

  afterEach(() => { jest.useRealTimers(); });

  it("creates a review note with auto-numbering and SLA config", async () => {
    const result = await reviewNotesEngine.create(ACTOR, {
      engagementId: "eng-1",
      targetType: "statement",
      targetId: "fs-1",
      reviewStage: "execution",
      priority: "high",
      comment: "Expand cash narrative",
    });

    expect(mockedPrisma.reviewNote.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          engagementId: "eng-1",
          reviewNoteNumber: "RN-1",
          priority: "high",
          status: "raised",
        }),
      }),
    );
    expect(mockedPrisma.reviewNoteSLA.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reviewNoteId: "note-1",
          slaTargetHours: 24, // high priority = 24h
        }),
      }),
    );
  });

  it("assigns a review note and transitions to assigned", async () => {
    mockedPrisma.reviewNote.update.mockResolvedValue(mockNote({ status: "assigned", assignedToId: "user-3" }));

    const result = await reviewNotesEngine.assign(ACTOR, "note-1", "eng-1", "user-3");
    expect(result.status).toBe("assigned");
  });

  it("starts work and transitions to in_progress", async () => {
    mockedPrisma.reviewNote.update.mockResolvedValue(mockNote({ status: "in_progress" }));

    const result = await reviewNotesEngine.startWork(ACTOR, "note-1", "eng-1");
    expect(result.status).toBe("in_progress");
  });

  it("responds to a review note and transitions to responded", async () => {
    mockedPrisma.reviewNote.update.mockResolvedValue(mockNote({ status: "responded", responseDescription: "Done" }));

    const result = await reviewNotesEngine.respond(ACTOR, "note-1", "eng-1", "Done");
    expect(result.status).toBe("responded");
  });

  it("closes a review note when satisfactory", async () => {
    mockedPrisma.reviewNote.update.mockResolvedValue(mockNote({ status: "closed", reviewerConclusion: "satisfactory" }));

    const result = await reviewNotesEngine.review(ACTOR, "note-1", "eng-1", "satisfactory");
    expect(result.status).toBe("closed");
  });

  it("re-opens a review note when needs revision", async () => {
    mockedPrisma.reviewNote.update.mockResolvedValue(mockNote({ status: "assigned", reviewerConclusion: "needs_revision" }));

    const result = await reviewNotesEngine.review(ACTOR, "note-1", "eng-1", "needs_revision");
    expect(result.status).toBe("assigned");
  });

  it("escalates a review note and marks SLA as breached", async () => {
    mockedPrisma.reviewNoteEscalation.create.mockResolvedValue({ id: "esc-1", reviewNoteId: "note-1", escalationLevel: "manager" });
    mockedPrisma.reviewNoteSLA.update.mockResolvedValue({ id: "sla-1", slaBreached: true });

    await reviewNotesEngine.escalate(ACTOR, "note-1", "eng-1", "manager", "SLA exceeded");
    expect(mockedPrisma.reviewNoteEscalation.create).toHaveBeenCalled();
    // Verify SLA was marked as breached
    const updateCall = mockedPrisma.reviewNoteSLA.update.mock.calls[0]?.[0];
    expect(updateCall?.data?.slaBreached).toBe(true);
  });

  it("returns SLA metrics for an engagement", async () => {
    const threeHoursAgo = new Date(NOW.getTime() - 3 * 3_600_000);
    mockedPrisma.reviewNote.findMany.mockResolvedValue([
      mockNote({ id: "n1", raisedAt: threeHoursAgo, slaConfig: { slaTargetHours: 24, slaWarningThreshold: 0.8, slaBreached: false } }),
      mockNote({ id: "n2", raisedAt: new Date(NOW.getTime() - 30 * 3_600_000), slaConfig: { slaTargetHours: 24, slaWarningThreshold: 0.8, slaBreached: true } }),
    ]);

    const metrics = await reviewNotesEngine.getSLAMetrics("eng-1");
    expect(metrics.total).toBe(2);
    expect(metrics.breached).toBe(1);
    expect(metrics.warning).toBe(0);
    expect(metrics.healthy).toBe(1);
  });

  it("returns SLA targets by priority", () => {
    const targets = reviewNotesEngine.getSLATargets();
    expect(targets.critical.responseHrs).toBe(4);
    expect(targets.low.responseHrs).toBe(168);
  });
});
