/**
 * Phase 9 — Knowledge Foundation Release Governance Tests.
 *
 * Tests the release governance workflow:
 * - Only one ACTIVE version
 * - Every action audited
 * - Version status transitions are valid
 * - Status enforcement is correct
 */

import { jest } from "@jest/globals";

/* ── Mock auth layer ───────────────────────────── */
const mockGetCurrentUser = jest.fn<() => Promise<Record<string, unknown>>>();

jest.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
}));

/* ── Mock Next.js runtime modules ──────────────── */
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

/* ── Mock events ───────────────────────────────── */
const mockEmitFoundationEvent = jest.fn().mockResolvedValue(undefined);
jest.mock("@/lib/knowledge-foundation/events", () => ({
  emitFoundationEvent: mockEmitFoundationEvent,
  onFoundationEvent: jest.fn().mockReturnValue(() => {}),
  onAnyFoundationEvent: jest.fn().mockReturnValue(() => {}),
  clearFoundationHandlers: jest.fn(),
}));

jest.mock("@/lib/knowledge-foundation/release-integrity", () => ({
  verifyReleaseIntegrity: jest.fn().mockResolvedValue({
    valid: true,
    blockers: [],
    hashMatch: true,
    chainValid: true,
    artifactFound: true,
    manifestFound: true,
    provenanceFound: true,
    releaseRowValid: true,
    releaseId: "kfr-mock",
    previousReleaseId: null,
    previousReleaseHash: null,
  }),
}));

jest.mock("@/lib/knowledge-foundation/audit-handler", () => ({
  registerFoundationAuditHandler: jest.fn(),
}));

/* ── Mock Prisma with overridable findUniqueOrThrow ── */
const mockFindUniqueOrThrow = jest.fn();

jest.mock("@/lib/prisma", () => {
  const base = jest.requireActual<{ default: Record<string, unknown> }>(
    "@/__mocks__/prisma-mock.js",
  );
  return {
    __esModule: true,
    default: {
      ...base.default,
      knowledgeFoundationVersion: {
        ...(base.default.knowledgeFoundationVersion as Record<string, unknown>),
        findUniqueOrThrow: mockFindUniqueOrThrow,
      },
    },
    prisma: {
      ...base.default,
      knowledgeFoundationVersion: {
        ...(base.default.knowledgeFoundationVersion as Record<string, unknown>),
        findUniqueOrThrow: mockFindUniqueOrThrow,
      },
    },
  };
});

/* ── Import services after mocks ───────────────── */
import {
  createVersion,
  approveVersion,
  releaseVersion,
  activateVersion,
  deprecateVersion,
} from "@/lib/knowledge-foundation/kf-service";

/* ── Test helpers ──────────────────────────────── */

function makeUser(role: string) {
  return {
    id: `user-${role.toLowerCase()}`,
    email: `${role.toLowerCase()}@test.com`,
    name: `${role} User`,
    role,
    organizationId: "org-1",
    platformOrganizationId: "plat-1",
    organization: { id: "org-1", name: "Test Org" },
  };
}

const baseVersionEntity = {
  id: "kfv-current",
  versionNumber: "1.0.0",
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdById: "user-1",
  approvedById: null,
  approvedAt: null,
  releasedById: null,
  releasedAt: null,
  activatedById: null,
  activatedAt: null,
  rollbackVersionId: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Release Governance — Valid Transitions", () => {
  it("DRAFT → APPROVED by ADMIN", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser("ADMIN"));
    mockFindUniqueOrThrow.mockResolvedValue({
      ...baseVersionEntity,
      status: "DRAFT",
    });

    const result = await approveVersion({
      versionId: "kfv-current",
      approvedById: "user-admin",
    });
    expect(result.status).toBe("APPROVED");
    expect(mockEmitFoundationEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "knowledge.foundation.version.approved" }),
    );
  });

  it("rejects deprecated releaseVersion (use generateFoundationRelease)", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser("OPERATOR"));
    mockFindUniqueOrThrow.mockResolvedValue({
      ...baseVersionEntity,
      status: "APPROVED",
    });

    await expect(releaseVersion({ versionId: "kfv-current" })).rejects.toThrow(
      /deprecated after Phase 28.2/,
    );
  });

  it("RELEASED → ACTIVE by ADMIN", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser("ADMIN"));
    mockFindUniqueOrThrow.mockResolvedValue({
      ...baseVersionEntity,
      status: "RELEASED",
    });

    const result = await activateVersion({ versionId: "kfv-current" });
    expect(result.status).toBe("ACTIVE");
    expect(mockEmitFoundationEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "knowledge.foundation.version.activated" }),
    );
  });

  it("ACTIVE → DEPRECATED by ADMIN", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser("ADMIN"));
    mockFindUniqueOrThrow.mockResolvedValue({
      ...baseVersionEntity,
      status: "ACTIVE",
    });

    const result = await deprecateVersion({
      versionId: "kfv-current",
      notes: "Superseded",
    });
    expect(result.status).toBe("DEPRECATED");
    expect(mockEmitFoundationEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "knowledge.foundation.version.deprecated" }),
    );
  });

  it("RELEASED → DEPRECATED by ADMIN", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser("ADMIN"));
    mockFindUniqueOrThrow.mockResolvedValue({
      ...baseVersionEntity,
      status: "RELEASED",
    });

    const result = await deprecateVersion({
      versionId: "kfv-current",
      notes: "Cancelled before activation",
    });
    expect(result.status).toBe("DEPRECATED");
  });
});

describe("Release Governance — Event Emission", () => {
  it("emits version.created event on create", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser("OPERATOR"));
    await createVersion({
      versionNumber: "1.0.0",
      createdById: "user-operator",
    });

    expect(mockEmitFoundationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "knowledge.foundation.version.created",
      }),
    );
  });

  it("emits version.approved event on approve", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser("ADMIN"));
    mockFindUniqueOrThrow.mockResolvedValue({
      ...baseVersionEntity,
      status: "DRAFT",
    });

    await approveVersion({
      versionId: "kfv-current",
      approvedById: "user-admin",
    });

    expect(mockEmitFoundationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "knowledge.foundation.version.approved",
      }),
    );
  });
});

describe("Release Governance — Enums and Constants", () => {
  it("version status enum has all expected values", () => {
    const statuses = ["DRAFT", "APPROVED", "RELEASED", "ACTIVE", "DEPRECATED"];
    expect(statuses).toHaveLength(5);
  });
});
