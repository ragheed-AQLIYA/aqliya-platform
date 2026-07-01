/**
 * Phase 28.4 — Release integrity verification tests (DB truth + FS evidence).
 */

import { jest } from "@jest/globals";
import * as fs from "fs";
import * as crypto from "crypto";

const mockEmitFoundationEvent = jest.fn<() => Promise<void>>();
const mockFindVersion = jest.fn();
const mockFindRelease = jest.fn();
const mockAccess = jest.fn();
const mockReadFile = jest.fn();

jest.mock("@/lib/knowledge-foundation/events", () => ({
  emitFoundationEvent: mockEmitFoundationEvent,
  onFoundationEvent: jest.fn().mockReturnValue(() => {}),
  onAnyFoundationEvent: jest.fn().mockReturnValue(() => {}),
  clearFoundationHandlers: jest.fn(),
}));

jest.mock("fs", () => ({
  promises: {
    access: mockAccess,
    readFile: mockReadFile,
  },
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    knowledgeFoundationVersion: {
      findUnique: mockFindVersion,
    },
    knowledgeFoundationRelease: {
      findFirst: mockFindRelease,
    },
  },
}));

import { verifyReleaseIntegrity } from "@/lib/knowledge-foundation/release-integrity";

const ACTOR = "user-admin";
const VERSION_ID = "kfv-v1";
const RELEASE_ID = "kfr-1";
const PARENT_RELEASE_ID = "kfr-parent";

const provenanceSnapshot = {
  versionId: VERSION_ID,
  versionNumber: "1.0.0",
  candidateCount: 1,
  candidates: [],
};

const foundationContent = JSON.stringify(
  { versionId: VERSION_ID, rules: [], versionNumber: "1.0.0" },
  null,
  2,
);
const validHash = crypto.createHash("sha256").update(foundationContent).digest("hex");

function mockReleasedVersion() {
  mockFindVersion.mockResolvedValue({
    id: VERSION_ID,
    status: "RELEASED",
    versionNumber: "1.0.0",
  });
}

function mockCompleteRelease(overrides: Record<string, unknown> = {}) {
  mockFindRelease.mockResolvedValue({
    id: RELEASE_ID,
    versionId: VERSION_ID,
    artifactStatus: "COMPLETE",
    manifestSha256: validHash,
    provenanceSnapshot,
    previousReleaseId: null,
    previousReleaseHash: null,
    previousRelease: null,
    ...overrides,
  });
}

function mockFsEvidenceOk() {
  mockAccess.mockResolvedValue(undefined);
  mockReadFile.mockImplementation(async (filePath: string) => {
    if (String(filePath).endsWith("knowledge-foundation.json")) {
      return foundationContent;
    }
    if (String(filePath).endsWith("provenance-manifest.json")) {
      return JSON.stringify(provenanceSnapshot);
    }
    throw new Error("unexpected read");
  });
}

describe("Phase 28.4 — verifyReleaseIntegrity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReleasedVersion();
    mockCompleteRelease();
    mockFsEvidenceOk();
  });

  it("passes when DB COMPLETE + hash match + FS evidence present", async () => {
    const result = await verifyReleaseIntegrity(VERSION_ID, {
      actorId: ACTOR,
      emitAudit: true,
    });

    expect(result.valid).toBe(true);
    expect(result.hashMatch).toBe(true);
    expect(result.artifactFound).toBe(true);
    expect(result.manifestFound).toBe(true);
    expect(result.chainValid).toBe(true);
    expect(mockEmitFoundationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "knowledge.foundation.integrity.verified",
      }),
    );
  });

  it("fails on hash mismatch and emits integrity.failed", async () => {
    mockCompleteRelease({ manifestSha256: "deadbeef".repeat(8) });

    const result = await verifyReleaseIntegrity(VERSION_ID, {
      actorId: ACTOR,
      emitAudit: true,
    });

    expect(result.valid).toBe(false);
    expect(result.hashMatch).toBe(false);
    expect(result.blockers.some((b) => b.includes("Hash mismatch"))).toBe(true);
    expect(mockEmitFoundationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "knowledge.foundation.integrity.failed",
      }),
    );
  });

  it("fails when artifact missing on disk", async () => {
    mockAccess.mockRejectedValue(new Error("ENOENT"));

    const result = await verifyReleaseIntegrity(VERSION_ID, {
      actorId: ACTOR,
      emitAudit: true,
    });

    expect(result.valid).toBe(false);
    expect(result.artifactFound).toBe(false);
    expect(result.blockers.some((b) => b.includes("knowledge-foundation.json"))).toBe(
      true,
    );
  });

  it("fails when manifest.json missing on disk", async () => {
    mockAccess.mockImplementation(async (filePath: string) => {
      if (String(filePath).endsWith("manifest.json")) {
        throw new Error("ENOENT");
      }
    });
    mockReadFile.mockResolvedValue(foundationContent);

    const result = await verifyReleaseIntegrity(VERSION_ID, {
      actorId: ACTOR,
      emitAudit: true,
    });

    expect(result.valid).toBe(false);
    expect(result.manifestFound).toBe(false);
  });

  it("fails on broken trust chain", async () => {
    mockCompleteRelease({
      previousReleaseId: PARENT_RELEASE_ID,
      previousReleaseHash: "wrong-hash",
      previousRelease: {
        id: PARENT_RELEASE_ID,
        manifestSha256: validHash,
        artifactStatus: "COMPLETE",
      },
    });

    const result = await verifyReleaseIntegrity(VERSION_ID, {
      actorId: ACTOR,
      emitAudit: true,
    });

    expect(result.valid).toBe(false);
    expect(result.chainValid).toBe(false);
    expect(result.blockers.some((b) => b.includes("Trust chain broken"))).toBe(true);
  });

  it("validates explicit chain when previousReleaseHash matches parent", async () => {
    mockCompleteRelease({
      previousReleaseId: PARENT_RELEASE_ID,
      previousReleaseHash: validHash,
      previousRelease: {
        id: PARENT_RELEASE_ID,
        manifestSha256: validHash,
        artifactStatus: "COMPLETE",
      },
    });

    const result = await verifyReleaseIntegrity(VERSION_ID, {
      actorId: ACTOR,
      emitAudit: false,
    });

    expect(result.chainValid).toBe(true);
    expect(result.valid).toBe(true);
  });
});
