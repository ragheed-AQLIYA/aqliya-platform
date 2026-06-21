// ─── Unit Test: LocalContentOS Audit Events Dual-Write ───
// Tests that createLocalContentAuditEvent and createAiAuditEvent
// correctly dual-write to PlatformAuditLog.

jest.mock("@/lib/prisma", () => ({
  prisma: {
    localContentAuditEvent: {
      create: jest.fn(),
    },
    lcAiAuditEvent: {
      create: jest.fn(),
    },
  },
}));

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue({ ok: true }),
}));

jest.mock("@/lib/platform/audit/audit-store", () => ({
  appendToAuditChain: jest.fn().mockResolvedValue(undefined),
}));

import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { appendToAuditChain } from "@/lib/platform/audit/audit-store";
import {
  createLocalContentAuditEvent,
  createAiAuditEvent,
  AuditActions,
} from "@/lib/local-content/audit-events";
import { Product } from "@/lib/platform/audit-logger";

const mockLocalContentAuditCreate = prisma.localContentAuditEvent.create as jest.Mock;
const mockLcAiAuditCreate = prisma.lcAiAuditEvent.create as jest.Mock;

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

  it("writes to localContentAuditEvent and dual-writes with LOCAL_CONTENT productKey", async () => {
    mockLocalContentAuditCreate.mockResolvedValue({ id: "audit-1" });

    await createLocalContentAuditEvent(baseInput);

    expect(mockLocalContentAuditCreate).toHaveBeenCalledTimes(1);
    expect(mockLocalContentAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        projectId: "proj-1",
        actorId: "user-1",
        action: "project.created",
        entityType: "Project",
        entityId: "proj-1",
      }),
    });

    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
    expect(writePlatformAuditLog).toHaveBeenCalledWith({
      productKey: Product.LOCAL_CONTENT,
      action: "local_content.project.created",
      projectId: "proj-1",
      platformOrganizationId: undefined,
      actorId: "user-1",
      actorName: "Test User",
      targetType: "Project",
      targetId: "proj-1",
      metadata: undefined,
    });
  });

  it("passes platformOrganizationId when provided", async () => {
    mockLocalContentAuditCreate.mockResolvedValue({ id: "audit-2" });
    const input = { ...baseInput, platformOrganizationId: "plat-org-1" };

    await createLocalContentAuditEvent(input);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        platformOrganizationId: "plat-org-1",
      }),
    );
  });

  it("passes metadata to both writes", async () => {
    mockLocalContentAuditCreate.mockResolvedValue({ id: "audit-3" });
    const metadata = { reason: "test" };
    const input = { ...baseInput, metadata };

    await createLocalContentAuditEvent(input);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ metadata }),
    );
  });

  // ─── Error handling ───

  it("logs warning and does NOT throw when primary write fails, and still fires dual-write", async () => {
    mockLocalContentAuditCreate.mockRejectedValue(new Error("DB timeout"));
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    await expect(createLocalContentAuditEvent(baseInput)).resolves.not.toThrow();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[LocalContentOS] Audit event write failed: DB timeout"),
    );

    // Dual-write still fires
    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });

  it("does NOT throw when dual-write returns { ok: false } (writePlatformAuditLog is safe)", async () => {
    mockLocalContentAuditCreate.mockResolvedValue({ id: "audit-4" });
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: false, error: "Write failed" });

    await expect(createLocalContentAuditEvent(baseInput)).resolves.not.toThrow();

    expect(mockLocalContentAuditCreate).toHaveBeenCalledTimes(1);
    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
  });

  // ─── Edge cases ───

  it("handles missing platformOrganizationId gracefully", async () => {
    mockLocalContentAuditCreate.mockResolvedValue({ id: "audit-5" });
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

  it("prefixes action with local_content. in the dual-write", async () => {
    mockLocalContentAuditCreate.mockResolvedValue({ id: "audit-6" });

    await createLocalContentAuditEvent(baseInput);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "local_content.project.created",
      }),
    );
  });

  // ─── Hash chain ───

  it("appends to hash chain when dual-write returns ok:true with id", async () => {
    mockLocalContentAuditCreate.mockResolvedValue({ id: "audit-7" });
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({
      ok: true,
      id: "plat-log-1",
    });

    await createLocalContentAuditEvent(baseInput);

    expect(appendToAuditChain).toHaveBeenCalledTimes(1);
    expect(appendToAuditChain).toHaveBeenCalledWith(
      "plat-log-1",
      "local_content.project.created",
      "user-1",
    );
  });

  it("does NOT append to hash chain when dual-write returns ok:false", async () => {
    mockLocalContentAuditCreate.mockResolvedValue({ id: "audit-8" });
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({
      ok: false,
      id: "plat-log-2",
    });

    await createLocalContentAuditEvent(baseInput);

    expect(appendToAuditChain).not.toHaveBeenCalled();
  });

  it("does NOT append to hash chain when dual-write returns ok:true without id", async () => {
    mockLocalContentAuditCreate.mockResolvedValue({ id: "audit-9" });
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: true });

    await createLocalContentAuditEvent(baseInput);

    expect(appendToAuditChain).not.toHaveBeenCalled();
  });

  it("passes before/after values to the primary write only", async () => {
    mockLocalContentAuditCreate.mockResolvedValue({ id: "audit-7" });
    const input = {
      ...baseInput,
      before: JSON.stringify({ status: "draft" }),
      after: JSON.stringify({ status: "active" }),
    };

    await createLocalContentAuditEvent(input);

    expect(mockLocalContentAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        before: JSON.stringify({ status: "draft" }),
        after: JSON.stringify({ status: "active" }),
      }),
    });
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

  it("writes to lcAiAuditEvent and dual-writes with LOCAL_CONTENT productKey", async () => {
    mockLcAiAuditCreate.mockResolvedValue({ id: "ai-audit-1" });

    await createAiAuditEvent(baseInput);

    expect(mockLcAiAuditCreate).toHaveBeenCalledTimes(1);
    expect(mockLcAiAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: "org-1",
        action: "ai.review_run",
        status: "success",
      }),
    });

    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        productKey: Product.LOCAL_CONTENT,
        action: "local_content.ai.ai.review_run",
        platformOrganizationId: "org-1",
        projectId: "proj-1",
        actorId: "user-1",
        aiProvider: "openai",
        aiModel: "gpt-4",
        aiPromptVersion: "v2",
        targetType: "AiAuditEvent",
        severity: "info",
      }),
    );
  });

  // ─── Severity mapping ───

  it("maps status 'success' to severity 'info'", async () => {
    mockLcAiAuditCreate.mockResolvedValue({ id: "ai-audit-2" });

    await createAiAuditEvent({ ...baseInput, status: "success" });

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "info" }),
    );
  });

  it("maps status 'partial' to severity 'warning'", async () => {
    mockLcAiAuditCreate.mockResolvedValue({ id: "ai-audit-3" });

    await createAiAuditEvent({ ...baseInput, status: "partial" });

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "warning" }),
    );
  });

  it("maps status 'failed' to severity 'error'", async () => {
    mockLcAiAuditCreate.mockResolvedValue({ id: "ai-audit-4" });

    await createAiAuditEvent({ ...baseInput, status: "failed" });

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ severity: "error" }),
    );
  });

  // ─── Metadata merging ───

  it("merges metadata with workbookId, confidence, warningCount, durationMs", async () => {
    mockLcAiAuditCreate.mockResolvedValue({ id: "ai-audit-5" });
    const customMeta = { extraField: "value" };

    await createAiAuditEvent({ ...baseInput, metadata: customMeta });

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          workbookId: "wb-1",
          confidence: 0.85,
          warningCount: 0,
          durationMs: 1500,
          extraField: "value",
        }),
      }),
    );
  });

  // ─── Error handling ───

  it("logs warning and does NOT throw when primary write fails, and still fires dual-write", async () => {
    mockLcAiAuditCreate.mockRejectedValue(new Error("AI audit DB error"));
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    await expect(createAiAuditEvent(baseInput)).resolves.not.toThrow();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[LocalContentOS] AI audit event write failed: AI audit DB error"),
    );

    // Dual-write still fires
    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });

  it("does NOT throw when dual-write returns { ok: false } (writePlatformAuditLog is safe)", async () => {
    mockLcAiAuditCreate.mockResolvedValue({ id: "ai-audit-6" });
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: false, error: "Write failed" });

    await expect(createAiAuditEvent(baseInput)).resolves.not.toThrow();

    expect(mockLcAiAuditCreate).toHaveBeenCalledTimes(1);
    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
  });

  // ─── Edge case: minimal input ───

  it("handles minimal input without optional fields", async () => {
    mockLcAiAuditCreate.mockResolvedValue({ id: "ai-audit-7" });
    const minimalInput = {
      organizationId: "org-2",
      action: "ai.pattern_suggested",
      status: "success" as const,
    };

    await createAiAuditEvent(minimalInput);

    expect(mockLcAiAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: "org-2",
        action: "ai.pattern_suggested",
        projectId: null,
        actorId: null,
        providerId: null,
        warningCount: 0,
        durationMs: 0,
      }),
    });

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "local_content.ai.ai.pattern_suggested",
        projectId: undefined,
        severity: "info",
        metadata: expect.objectContaining({
          workbookId: undefined,
          confidence: undefined,
          warningCount: undefined,
          durationMs: undefined,
        }),
      }),
    );
  });

  // ─── Hash chain for AI audit events ───

  it("appends to hash chain for AI audit when dual-write returns ok:true with id", async () => {
    mockLcAiAuditCreate.mockResolvedValue({ id: "ai-audit-8" });
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({
      ok: true,
      id: "plat-log-ai-1",
    });

    await createAiAuditEvent(baseInput);

    expect(appendToAuditChain).toHaveBeenCalledTimes(1);
    expect(appendToAuditChain).toHaveBeenCalledWith(
      "plat-log-ai-1",
      "local_content.ai.ai.review_run",
      "user-1",
    );
  });

  it("does NOT append to hash chain for AI audit when dual-write returns ok:false", async () => {
    mockLcAiAuditCreate.mockResolvedValue({ id: "ai-audit-9" });
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({
      ok: false,
      id: "plat-log-ai-2",
    });

    await createAiAuditEvent(baseInput);

    expect(appendToAuditChain).not.toHaveBeenCalled();
  });

  it("uses 'system' as fallback actorId in hash chain when actorId is not provided", async () => {
    mockLcAiAuditCreate.mockResolvedValue({ id: "ai-audit-10" });
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
      "local_content.ai.ai.pattern_suggested",
      "system",
    );
  });
});

