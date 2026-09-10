// ─── LocalContentOS Evidence Upload + File Scan Integration Tests ───
// Tests uploadLocalContentEvidenceFileAction with scanEvidenceFile integration.
// NOTE: jest.mock for @/lib/audit/file-scanner must come FIRST (before all other jest.mock),
// and all other jest.mock calls must come AFTER imports.

jest.mock("@/lib/audit/file-scanner", () => ({
  scanEvidenceFile: jest.fn(),
  isScanRejected: jest.fn((r: { status: string }) =>
    r.status === "infected" || r.status === "error"
  ),
  isScanningSafe: jest.fn(() => true),
}));

// ── Imports ──
import { scanEvidenceFile } from "@/lib/audit/file-scanner";
const mockScan = scanEvidenceFile as jest.Mock;

import {
  uploadLocalContentEvidenceFileAction,
} from "@/actions/localcontent-actions";

import { PrismaClient } from "@/generated/prisma/client";
const prisma = new PrismaClient();

// ── Remaining jest.mock calls must come AFTER imports ──
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

jest.mock("@/lib/platform/storage", () => ({
  getStorageProvider: () => ({
    store: jest.fn(async () => ({})),
    delete: jest.fn(async () => {}),
    get: jest.fn(async () => null),
  }),
}));

jest.mock("@/lib/core/evidence/link-after-upload", () => ({
  linkLocalContentEvidenceAfterUpload: jest.fn(async () => {}),
}));

// ─── Environment ────────────────────────────────────────────────────────────

beforeEach(() => {
  process.env.NODE_ENV = "test";
  delete process.env.SCANNER_PROVIDER;
  mockScan.mockReset();
});

// ─── Helpers ────────────────────────────────────────────────────────────────

const MOCK_ORG_ID = "test-org-id";

function makeFormData(
  overrides: Record<string, string> = {},
  includeFile = false,
): FormData {
  const fd = new FormData();
  fd.set("filename", overrides.filename ?? "test-report.pdf");

  if (includeFile) {
    const buffer = Buffer.from(overrides.fileContent ?? "fake pdf content here", "utf-8");
    const file = new File([buffer], overrides.filename ?? "test-report.pdf", {
      type: overrides.fileType ?? "application/pdf",
    });
    fd.set("file", file);
  }

  fd.set("evidenceType", overrides.evidenceType ?? "certificate");
  fd.set("supplierId", overrides.supplierId ?? "");
  return fd;
}

function seedProject(overrides: Record<string, unknown> = {}) {
  return prisma.localContentProject.create({
    data: {
      name: "Test LCOS Project",
      organizationId: MOCK_ORG_ID,
      status: "active",
      ...overrides,
    },
  });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("uploadLocalContentEvidenceFileAction — scan integration", () => {
  it("calls scanEvidenceFile when file is provided", async () => {
    const project = await seedProject();
    mockScan.mockResolvedValueOnce({
      status: "clean",
      provider: "dev-mock",
      scannedAt: new Date().toISOString(),
      details: "Clean file",
    });

    const result = await uploadLocalContentEvidenceFileAction(
      project.id,
      makeFormData({}, true /* include file */),
    );

    expect(result.ok).toBe(true);
    expect(mockScan).toHaveBeenCalledTimes(1);
    expect(mockScan).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: "test-report.pdf",
        fileType: "pdf",
      }),
    );
  });

  it("does NOT call scanEvidenceFile when only filename is provided (no file)", async () => {
    const project = await seedProject();

    const result = await uploadLocalContentEvidenceFileAction(
      project.id,
      makeFormData({}, false /* no file */),
    );

    expect(result.ok).toBe(true);
    expect(mockScan).toHaveBeenCalledTimes(0);
  });

  it("rejects upload when scan returns infected", async () => {
    const project = await seedProject();
    mockScan.mockResolvedValueOnce({
      status: "infected",
      provider: "clamav",
      scannedAt: new Date().toISOString(),
      details: "Eicar-Test-Signature found",
    });

    const result = await uploadLocalContentEvidenceFileAction(
      project.id,
      makeFormData({ filename: "virus.pdf" }, true),
    );

    expect(result.ok).toBe(false);
    expect(mockScan).toHaveBeenCalledTimes(1);
  });

  it("rejects upload when scan errors", async () => {
    const project = await seedProject();
    mockScan.mockResolvedValueOnce({
      status: "error",
      provider: "none",
      scannedAt: new Date().toISOString(),
      details: "Scanner not configured",
    });

    const result = await uploadLocalContentEvidenceFileAction(
      project.id,
      makeFormData({}, true),
    );

    expect(result.ok).toBe(false);
  });

  it("calls scan with file buffer content", async () => {
    const project = await seedProject();
    const capturedArgs: unknown[] = [];
    mockScan.mockImplementation(async (...args: unknown[]) => {
      capturedArgs.push(args[0]);
      return {
        status: "clean",
        provider: "dev-mock",
        scannedAt: new Date().toISOString(),
        details: "Clean file",
      };
    });

    await uploadLocalContentEvidenceFileAction(
      project.id,
      makeFormData({}, true),
    );

    expect(capturedArgs).toHaveLength(1);
    expect(capturedArgs[0]).toHaveProperty("content");
    expect(Buffer.isBuffer((capturedArgs[0] as Record<string, unknown>).content)).toBe(true);
  });
});
