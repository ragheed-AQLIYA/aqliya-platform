// ─── Unit Test: LocalContentOS Audit Events Single-Write ───
// Tests that createLocalContentAuditEvent and createAiAuditEvent
// correctly write to PlatformAuditLog only (single-write, no old model).

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue({ ok: true }),
}));

jest.mock("@/lib/platform/audit/audit-store", () => ({
  appendToAuditChain: jest.fn().mockResolvedValue(undefined),
}));

import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { appendToAuditChain } from "@/lib/platform/audit/audit-store";
import {
  createLocalContentAuditEvent,
  createAiAuditEvent,
  AuditActions,
} from "@/lib/local-content/audit-events";
import { Product } from "@/lib/platform/audit-logger";

// ─── createLocalContentAuditEvent ───

describe("createLocalContentAuditEvent", () => {
  const baseInput = {
    projectId: "proj-1",
    actorId: "user-1",
    actorName: "Test User",
    action: AuditActions.PROJECT_CREATED,
    entityType: "Project",
    entityId: "proj-1",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Happy path ───

  it("writes to PlatformAuditLog with LOCAL_CONTENT productKey (single-write)", async () => {
    await createLocalContentAuditEvent(baseInput);

    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
    expect(writePlatformAuditLog).toHaveBeenCalledWith({
      productKey: Product.LOCAL_CONTENT,
      action: "project.created",
      projectId: "proj-1",
      platformOrganizationId: undefined,
      actorId: "user-1",
      actorName: "Test User",
      targetType: "Project",
      targetId: "proj-1",
      beforeState: undefined,
      afterState: undefined,
      metadata: undefined,
    });
  });

  it("passes platformOrganizationId when provided", async () => {
    const input = { ...baseInput, platformOrganizationId: "plat-org-1" };

    await createLocalContentAuditEvent(input);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        platformOrganizationId: "plat-org-1",
      }),
    );
  });

  it("passes metadata to the write", async () => {
    const metadata = { reason: "test" };
    const input = { ...baseInput, metadata };

    await createLocalContentAuditEvent(input);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ metadata }),
    );
  });

  // ─── Error handling ───

  it("does NOT throw when primary write returns { ok: false } (writePlatformAuditLog is safe)", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: false, error: "DB timeout" });

    await expect(createLocalContentAuditEvent(baseInput)).resolves.not.toThrow();

    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
  });

  it("does NOT throw when writePlatformAuditLog returns { ok: false }", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: false, error: "Write failed" });

    await expect(createLocalContentAuditEvent(baseInput)).resolves.not.toThrow();

    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
  });

  // ─── Edge cases ───

  it("handles missing platformOrganizationId gracefully", async () => {
    const input = {
      projectId: "proj-2",
      actorId: "user-2",
      action: "supplier.created",
      entityType: "Supplier",
      entityId: "sup-1",
    };

    await createLocalContentAuditEvent(input);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        platformOrganizationId: undefined,
      }),
    );
  });

  it("passes action directly (no local_content. prefix in action)", async () => {
    await createLocalContentAuditEvent(baseInput);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "project.created",
      }),
    );
  });

  // ─── Hash chain ───

  it("appends to hash chain when write returns ok:true with id", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({
      ok: true,
      id: "plat-log-1",
    });

    await createLocalContentAuditEvent(baseInput);

    expect(appendToAuditChain).toHaveBeenCalledTimes(1);
    expect(appendToAuditChain).toHaveBeenCalledWith(
      "plat-log-1",
      "project.created",
      "user-1",
    );
  });

  it("does NOT append to hash chain when write returns ok:false", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({
      ok: false,
      id: "plat-log-2",
    });

    await createLocalContentAuditEvent(baseInput);

    expect(appendToAuditChain).not.toHaveBeenCalled();
  });

  it("does NOT append to hash chain when write returns ok:true without id", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: true });

    await createLocalContentAuditEvent(baseInput);

    expect(appendToAuditChain).not.toHaveBeenCalled();
  });

  it("passes before/after values to the write", async () => {
    const input = {
      ...baseInput,
      before: JSON.stringify({ status: "draft" }),
      after: JSON.stringify({ status: "active" }),
    };

    await createLocalContentAuditEvent(input);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        beforeState: JSON.stringify({ status: "draft" }),
        afterState: JSON.stringify({ status: "active" }),
      }),
    );
  });
});

// ─── createAiAuditEvent ───

describe("createAiAuditEvent", () => {
  const baseInput = {
    organizationId: "org-1",
    projectId: "proj-1",
    workbookId: "wb-1",
    action: "ai.review_run",
    actorId: "user-1",
    providerId: "openai",
    modelVersion: "gpt-4",
    promptVersion: "v2",
    confidence: 0.85,
    status: "success" as const,
    inputSummary: { records: 10 } as Record<string, unknown>,
    outputSummary: { findings: 3 } as Record<string, unknown>,
    warningCount: 0,
    durationMs: 1500,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Happy path ───

  it("writes to PlatformAuditLog with LOCAL_CONTENT productKey (single-write)", async () => {
    await createAiAuditEvent(baseInput);

    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        productKey: Product.LOCAL_CONTENT,
        action: "ai.review_run",
        organizationId: "org-1",
        projectId: "proj-1",
        actorId: "user-1",
        aiProvider: "openai",
        aiModel: "gpt-4",
        aiPromptVersion: "v2",
        aiRelated: true,
        targetType: "AiAuditEvent",
        targetId: "ai.review_run",
        severity: "info",
      }),
    );
  });

  // ─── Severity mapping ───

  it("maps status 'success' to severity 'info'", async () => {
    await createAiAuditEvent({ ...baseInput, status: "success" });

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "info" }),
    );
  });

  it("maps status 'partial' to severity 'warning'", async () => {
    await createAiAuditEvent({ ...baseInput, status: "partial" });

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warning" }),
    );
  });

  it("maps status 'failed' to severity 'error'", async () => {
    await createAiAuditEvent({ ...baseInput, status: "failed" });

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error" }),
    );
  });

  // ─── Metadata merging ───

  it("merges metadata with workbookId, confidence, warningCount, durationMs", async () => {
    const customMeta = { extraField: "value" };

    await createAiAuditEvent({ ...baseInput, metadata: customMeta });

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        aiConfidence: 0.85,
        durationMs: 1500,
        metadata: expect.objectContaining({
          workbookId: "wb-1",
          warningCount: 0,
          extraField: "value",
        }),
      }),
    );
  });

  // ─── Error handling ───

  it("does NOT throw when write returns { ok: false } (writePlatformAuditLog is safe)", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: false, error: "AI audit DB error" });

    await expect(createAiAuditEvent(baseInput)).resolves.not.toThrow();

    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
  });

  it("does NOT throw when writePlatformAuditLog returns { ok: false }", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: false, error: "Write failed" });

    await expect(createAiAuditEvent(baseInput)).resolves.not.toThrow();

    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
  });

  // ─── Edge case: minimal input ───

  it("handles minimal input without optional fields", async () => {
    const minimalInput = {
      organizationId: "org-2",
      action: "ai.pattern_suggested",
      status: "success" as const,
    };

    await createAiAuditEvent(minimalInput);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "ai.pattern_suggested",
        organizationId: "org-2",
        projectId: undefined,
        severity: "info",
        aiConfidence: undefined,
        durationMs: undefined,
        metadata: expect.objectContaining({
          workbookId: undefined,
          warningCount: undefined,
        }),
      }),
    );
  });

  // ─── Hash chain for AI audit events ───

  it("appends to hash chain for AI audit when write returns ok:true with id", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({
      ok: true,
      id: "plat-log-ai-1",
    });

    await createAiAuditEvent(baseInput);

    expect(appendToAuditChain).toHaveBeenCalledTimes(1);
    expect(appendToAuditChain).toHaveBeenCalledWith(
      "plat-log-ai-1",
      "ai.review_run",
      "user-1",
    );
  });

  it("does NOT append to hash chain for AI audit when write returns ok:false", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({
      ok: false,
      id: "plat-log-ai-2",
    });

    await createAiAuditEvent(baseInput);

    expect(appendToAuditChain).not.toHaveBeenCalled();
  });

  it("uses 'system' as fallback actorId in hash chain when actorId is not provided", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({
      ok: true,
      id: "plat-log-ai-3",
    });
    const inputNoActor = {
      organizationId: "org-1",
      action: "ai.pattern_suggested",
      status: "success" as const,
    };

    await createAiAuditEvent(inputNoActor);

    expect(appendToAuditChain).toHaveBeenCalledWith(
      "plat-log-ai-3",
      "ai.pattern_suggested",
      "system",
    );
  });
});
