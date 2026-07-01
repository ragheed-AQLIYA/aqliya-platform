/**
 * Phase 9 — Knowledge Foundation Version Governance Tests.
 *
 * Tests the full release lifecycle:
 * - Version creation
 * - Approval flow
 * - Release flow
 * - Activation flow
 * - RBAC enforcement (OPERATOR creates, ADMIN approves/activates)
 */

import { jest } from "@jest/globals";

/* ── Mock auth layer ───────────────────────────── */
const mockGetCurrentUser = jest.fn<() => Promise<Record<string, unknown>>>();

jest.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
}));

/* ── Mock Next.js runtime modules ──────────────── */
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

/* ── Mock events (no-op to avoid audit handler side effects) ─── */
jest.mock("@/lib/knowledge-foundation/events", () => ({
  emitFoundationEvent: jest.fn().mockResolvedValue(undefined),
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
  getVersions,
  getFoundationKPIs,
} from "@/lib/knowledge-foundation/kf-service";

/* ── Test helpers ──────────────────────────────── */

function makeUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "user-session",
    email: "user@test.com",
    name: "Session User",
    role: "OPERATOR",
    organizationId: "org-1",
    platformOrganizationId: "plat-1",
    organization: { id: "org-1", name: "Test Org" },
    ...overrides,
  };
}

const defaultVersionEntity = {
  id: "kfv-1",
  versionNumber: "1.0.0",
  status: "DRAFT",
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
  mockFindUniqueOrThrow.mockReset();
});

describe("Knowledge Foundation — Version Creation", () => {
  beforeEach(() => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "OPERATOR" }));
    mockFindUniqueOrThrow.mockImplementation((args: { where?: { id?: string } }) => ({
      ...defaultVersionEntity,
      id: args?.where?.id ?? "kfv-1",
    }));
  });

  it("creates a version as DRAFT when user is OPERATOR", async () => {
    const result = await createVersion({
      versionNumber: "1.0.0",
      createdById: "user-session",
    });
    expect(result).toBeDefined();
    expect(result.status).toBe("DRAFT");
  });

  it("creates a version with notes", async () => {
    const result = await createVersion({
      versionNumber: "1.0.0",
      notes: "Initial knowledge foundation",
      createdById: "user-session",
    });
    expect(result).toBeDefined();
  });

  it("throws when user is VIEWER (cannot create)", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "VIEWER" }));
    await expect(
      createVersion({ versionNumber: "1.0.0", createdById: "user-viewer" }),
    ).rejects.toThrow("Access denied");
  });
});

describe("Knowledge Foundation — Approval Flow", () => {
  beforeEach(() => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "ADMIN" }));
    mockFindUniqueOrThrow.mockResolvedValue({
      ...defaultVersionEntity,
      status: "DRAFT",
    });
  });

  it("approves a DRAFT version when user is ADMIN", async () => {
    const result = await approveVersion({
      versionId: "kfv-1",
      approvedById: "user-session",
    });
    expect(result).toBeDefined();
  });

  it("throws when VIEWER tries to approve", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "VIEWER" }));
    await expect(
      approveVersion({ versionId: "kfv-1", approvedById: "user-viewer" }),
    ).rejects.toThrow("Access denied");
  });

  it("throws when OPERATOR tries to approve (ADMIN only)", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "OPERATOR" }));
    await expect(
      approveVersion({ versionId: "kfv-1", approvedById: "user-op" }),
    ).rejects.toThrow("Access denied");
  });
});

describe("Knowledge Foundation — Release Flow", () => {
  it("rejects deprecated releaseVersion", async () => {
    await expect(releaseVersion({ versionId: "kfv-1" })).rejects.toThrow(
      /deprecated after Phase 28.2/,
    );
  });
});

describe("Knowledge Foundation — Activation Flow", () => {
  beforeEach(() => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "ADMIN" }));
    mockFindUniqueOrThrow.mockResolvedValue({
      ...defaultVersionEntity,
      status: "RELEASED",
    });
  });

  it("activates a RELEASED version when user is ADMIN", async () => {
    const result = await activateVersion({ versionId: "kfv-1" });
    expect(result).toBeDefined();
    expect(result.status).toBe("ACTIVE");
  });

  it("throws when OPERATOR tries to activate (ADMIN only)", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "OPERATOR" }));
    await expect(
      activateVersion({ versionId: "kfv-1" }),
    ).rejects.toThrow("Access denied");
  });
});

describe("Knowledge Foundation — Deprecation Flow", () => {
  beforeEach(() => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "ADMIN" }));
    mockFindUniqueOrThrow.mockResolvedValue({
      ...defaultVersionEntity,
      status: "ACTIVE",
    });
  });

  it("deprecates an ACTIVE version when user is ADMIN", async () => {
    const result = await deprecateVersion({
      versionId: "kfv-1",
      notes: "Superseded by v2.0.0",
    });
    expect(result).toBeDefined();
    expect(result.status).toBe("DEPRECATED");
  });

  it("throws when OPERATOR tries to deprecate", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "OPERATOR" }));
    await expect(
      deprecateVersion({ versionId: "kfv-1" }),
    ).rejects.toThrow("Access denied");
  });
});

describe("Knowledge Foundation — Queries", () => {
  beforeEach(() => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "VIEWER" }));
  });

  it("listVersions is accessible to VIEWER", async () => {
    const result = await getVersions();
    expect(Array.isArray(result)).toBe(true);
  });

  it("getFoundationKPIs is accessible to VIEWER", async () => {
    const result = await getFoundationKPIs();
    expect(result).toBeDefined();
    expect(typeof result.totalVersions).toBe("number");
  });
});
