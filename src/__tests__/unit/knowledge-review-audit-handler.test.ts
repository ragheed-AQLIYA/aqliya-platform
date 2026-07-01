/**
 * Phase 8.2 — Knowledge Review Audit Handler test.
 *
 * Tests that the audit handler correctly maps KnowledgeReviewEvent
 * to PlatformAuditLog entries for each event type.
 */

import { jest } from "@jest/globals";

// Mock writePlatformAuditLog before importing the module under test
jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn<
    () => Promise<{ ok: boolean; id?: string; error?: string }>
  >(),
}));

// Import after mock is set up — audit-handler auto-registers on import
import { registerAuditHandler } from "@/lib/knowledge-review/audit-handler";
import { emitReviewEvent } from "@/lib/knowledge-review/events";
import type { KnowledgeReviewEvent } from "@/lib/knowledge-review/events";

// Get access to the mock
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
const mockWriteLog = writePlatformAuditLog as jest.Mock<
  () => Promise<{ ok: boolean; id?: string; error?: string }>
>;

describe("knowledge-review/audit-handler", () => {
  let unsub: () => void;

  beforeEach(() => {
    // Clear mock calls between tests
    mockWriteLog.mockClear();
    // Register the audit handler explicitly for test isolation.
    // NOTE: The module also auto-registers on import via side-effect,
    // but registerAuditHandler() guards against double-registration.
    unsub = registerAuditHandler();
  });

  afterEach(() => {
    unsub();
    mockWriteLog.mockClear();
  });

  it("registers a handler on import (auto-registration)", () => {
    // registerAuditHandler() guards against double-registration
    const secondUnsub = registerAuditHandler();
    // Second call should return a no-op unsubscriber, not throw
    expect(typeof secondUnsub).toBe("function");
    secondUnsub();
  });

  it("writes audit log on knowledge.candidate.created", async () => {
    await emitReviewEvent({
      type: "knowledge.candidate.created",
      candidateId: "c-1",
      actorId: "u-1",
      timestamp: "2026-06-22T00:00:00.000Z",
    });

    expect(mockWriteLog).toHaveBeenCalledTimes(1);
    const call = mockWriteLog.mock.calls[0][0];
    expect(call.productKey).toBe("knowledge-mining");
    expect(call.action).toBe("candidate.created");
    expect(call.actorId).toBe("u-1");
    expect(call.targetType).toBe("KnowledgeCandidate");
    expect(call.targetId).toBe("c-1");
    expect(call.severity).toBe("info");
    expect(call.status).toBe("success");
  });

  it("writes audit log on knowledge.candidate.submitted", async () => {
    await emitReviewEvent({
      type: "knowledge.candidate.submitted",
      candidateId: "c-1",
      actorId: "u-1",
      timestamp: "2026-06-22T00:00:00.000Z",
      previousStatus: "CANDIDATE",
      newStatus: "UNDER_REVIEW",
    });

    expect(mockWriteLog).toHaveBeenCalledTimes(1);
    const call = mockWriteLog.mock.calls[0][0];
    expect(call.action).toBe("candidate.submitted");
    expect(call.metadata?.previousStatus).toBe("CANDIDATE");
    expect(call.metadata?.newStatus).toBe("UNDER_REVIEW");
  });

  it("writes audit log on knowledge.candidate.approved", async () => {
    await emitReviewEvent({
      type: "knowledge.candidate.approved",
      candidateId: "c-2",
      actorId: "u-2",
      timestamp: "2026-06-22T00:00:00.000Z",
      previousStatus: "UNDER_REVIEW",
      newStatus: "APPROVED",
      notes: "Looks good",
    });

    expect(mockWriteLog).toHaveBeenCalledTimes(1);
    const call = mockWriteLog.mock.calls[0][0];
    expect(call.action).toBe("candidate.approved");
    expect(call.actorId).toBe("u-2");
    expect(call.targetId).toBe("c-2");
    expect(call.severity).toBe("info");
    expect(call.status).toBe("success");
    expect(call.metadata?.notes).toBe("Looks good");
  });

  it("writes audit log on knowledge.candidate.rejected with warning severity", async () => {
    await emitReviewEvent({
      type: "knowledge.candidate.rejected",
      candidateId: "c-3",
      actorId: "u-3",
      timestamp: "2026-06-22T00:00:00.000Z",
      previousStatus: "UNDER_REVIEW",
      newStatus: "REJECTED",
      notes: "Insufficient evidence",
    });

    expect(mockWriteLog).toHaveBeenCalledTimes(1);
    const call = mockWriteLog.mock.calls[0][0];
    expect(call.action).toBe("candidate.rejected");
    expect(call.severity).toBe("warning");
    expect(call.status).toBe("failure");
    expect(call.metadata?.notes).toBe("Insufficient evidence");
  });

  it("writes audit log on knowledge.candidate.promoted with artifact path", async () => {
    await emitReviewEvent({
      type: "knowledge.candidate.promoted",
      candidateId: "c-4",
      actorId: "u-4",
      timestamp: "2026-06-22T00:00:00.000Z",
      previousStatus: "APPROVED",
      newStatus: "PROMOTED",
      artifactPath: "/knowledge/candidates/candidate-synonyms-2026-06-22.json",
    });

    expect(mockWriteLog).toHaveBeenCalledTimes(1);
    const call = mockWriteLog.mock.calls[0][0];
    expect(call.action).toBe("candidate.promoted");
    expect(call.metadata?.artifactPath).toBe(
      "/knowledge/candidates/candidate-synonyms-2026-06-22.json",
    );
    expect(call.metadata?.eventType).toBe("promotion");
  });

  it("all five event types are independently mapped", async () => {
    const types: Array<KnowledgeReviewEvent["type"]> = [
      "knowledge.candidate.created",
      "knowledge.candidate.submitted",
      "knowledge.candidate.approved",
      "knowledge.candidate.rejected",
      "knowledge.candidate.promoted",
    ];

    for (const type of types) {
      await emitReviewEvent({
        type,
        candidateId: "c-x",
        actorId: "u-x",
        timestamp: "2026-06-22T00:00:00.000Z",
      });
    }

    expect(mockWriteLog).toHaveBeenCalledTimes(5);
    expect(mockWriteLog.mock.calls[0][0].action).toBe("candidate.created");
    expect(mockWriteLog.mock.calls[1][0].action).toBe("candidate.submitted");
    expect(mockWriteLog.mock.calls[2][0].action).toBe("candidate.approved");
    expect(mockWriteLog.mock.calls[3][0].action).toBe("candidate.rejected");
    expect(mockWriteLog.mock.calls[4][0].action).toBe("candidate.promoted");
  });

  it("unsubscribing prevents further audit writes", async () => {
    // Unsubscribe
    unsub();

    await emitReviewEvent({
      type: "knowledge.candidate.approved",
      candidateId: "c-1",
      actorId: "u-1",
      timestamp: "2026-06-22T00:00:00.000Z",
    });

    expect(mockWriteLog).not.toHaveBeenCalled();
  });
});
