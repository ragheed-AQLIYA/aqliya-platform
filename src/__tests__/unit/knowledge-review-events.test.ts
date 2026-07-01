/**
 * Phase 8.1 — Knowledge Review Events test.
 *
 * Tests the pub/sub notification foundation for knowledge review events.
 * No email or queue — only typed events and handler registration.
 */

import { jest } from "@jest/globals";

// No mocks needed — events module is pure logic with no Prisma/auth deps
import {
  emitReviewEvent,
  onReviewEvent,
  onAnyReviewEvent,
  clearHandlers,
} from "@/lib/knowledge-review/events";
import type { KnowledgeReviewEvent } from "@/lib/knowledge-review/events";

describe("knowledge-review/events", () => {
  afterEach(() => {
    clearHandlers();
  });

  it("fires registered handler for a specific event type", async () => {
    const handler = jest.fn<() => Promise<void>>();
    onReviewEvent("knowledge.candidate.approved", handler);

    await emitReviewEvent({
      type: "knowledge.candidate.approved",
      candidateId: "c-1",
      actorId: "u-1",
      timestamp: new Date().toISOString(),
    });

    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0] as KnowledgeReviewEvent;
    expect(event.type).toBe("knowledge.candidate.approved");
    expect(event.candidateId).toBe("c-1");
    expect(event.actorId).toBe("u-1");
  });

  it("does not fire handler for unrelated event types", async () => {
    const handler = jest.fn<() => Promise<void>>();
    onReviewEvent("knowledge.candidate.approved", handler);

    await emitReviewEvent({
      type: "knowledge.candidate.rejected",
      candidateId: "c-1",
      actorId: "u-1",
      timestamp: new Date().toISOString(),
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("fires wildcard handler for every event type", async () => {
    const wildcard = jest.fn<() => Promise<void>>();
    onAnyReviewEvent(wildcard);

    await emitReviewEvent({
      type: "knowledge.candidate.created",
      candidateId: "c-1",
      actorId: "u-1",
      timestamp: new Date().toISOString(),
    });

    await emitReviewEvent({
      type: "knowledge.candidate.promoted",
      candidateId: "c-1",
      actorId: "u-1",
      timestamp: new Date().toISOString(),
      artifactPath: "/tmp/artifact.json",
    });

    expect(wildcard).toHaveBeenCalledTimes(2);
  });

  it("unsubscribe removes handler", async () => {
    const handler = jest.fn<() => Promise<void>>();
    const unsub = onReviewEvent("knowledge.candidate.approved", handler);
    unsub();

    await emitReviewEvent({
      type: "knowledge.candidate.approved",
      candidateId: "c-1",
      actorId: "u-1",
      timestamp: new Date().toISOString(),
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("handler failure does not throw (caught via console.warn)", async () => {
    const failingHandler = jest.fn<() => Promise<void>>().mockRejectedValueOnce(new Error("fail"));
    onReviewEvent("knowledge.candidate.approved", failingHandler);

    // Should not throw
    await expect(
      emitReviewEvent({
        type: "knowledge.candidate.approved",
        candidateId: "c-1",
        actorId: "u-1",
        timestamp: new Date().toISOString(),
      }),
    ).resolves.toBeUndefined();

    expect(failingHandler).toHaveBeenCalledTimes(1);
  });

  it("no handlers is a no-op", async () => {
    await expect(
      emitReviewEvent({
        type: "knowledge.candidate.created",
        candidateId: "c-1",
        actorId: "u-1",
        timestamp: new Date().toISOString(),
      }),
    ).resolves.toBeUndefined();
  });

  it("clearHandlers for specific type", async () => {
    const handler = jest.fn<() => Promise<void>>();
    onReviewEvent("knowledge.candidate.approved", handler);
    clearHandlers("knowledge.candidate.approved");

    await emitReviewEvent({
      type: "knowledge.candidate.approved",
      candidateId: "c-1",
      actorId: "u-1",
      timestamp: new Date().toISOString(),
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("supports all five event types", async () => {
    const handler = jest.fn<() => Promise<void>>();
    const types: Array<KnowledgeReviewEvent["type"]> = [
      "knowledge.candidate.created",
      "knowledge.candidate.submitted",
      "knowledge.candidate.approved",
      "knowledge.candidate.rejected",
      "knowledge.candidate.promoted",
    ];

    for (const t of types) {
      onReviewEvent(t, handler);
    }

    for (const t of types) {
      await emitReviewEvent({
        type: t,
        candidateId: "c-1",
        actorId: "u-1",
        timestamp: new Date().toISOString(),
      });
    }

    expect(handler).toHaveBeenCalledTimes(5);
  });

  it("carries optional fields in event payload", async () => {
    const handler = jest.fn<() => Promise<void>>();
    onReviewEvent("knowledge.candidate.promoted", handler);

    await emitReviewEvent({
      type: "knowledge.candidate.promoted",
      candidateId: "c-1",
      actorId: "u-1",
      timestamp: new Date().toISOString(),
      notes: "Promoted after review",
      previousStatus: "APPROVED",
      newStatus: "PROMOTED",
      artifactPath: "/tmp/artifact.json",
      payload: { customField: "value" },
    });

    const event = handler.mock.calls[0][0] as KnowledgeReviewEvent;
    expect(event.notes).toBe("Promoted after review");
    expect(event.previousStatus).toBe("APPROVED");
    expect(event.newStatus).toBe("PROMOTED");
    expect(event.artifactPath).toBe("/tmp/artifact.json");
    expect(event.payload?.customField).toBe("value");
  });
});
