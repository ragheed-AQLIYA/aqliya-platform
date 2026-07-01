/**
 * Phase 27 — Knowledge Foundation hotfix regression tests.
 */

import { jest } from "@jest/globals";

const mockGetCurrentUser = jest.fn<() => Promise<Record<string, unknown>>>();
const mockFindManyVersions = jest.fn();
const mockUpdateVersion = jest.fn();
const mockFindUniqueOrThrowVersion = jest.fn();
const mockUpdateManyVersion = jest.fn();

jest.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
}));

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

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

jest.mock("fs", () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockReleaseCreate = jest.fn();
const mockReleaseUpdate = jest.fn();
const mockTransaction = jest.fn();

jest.mock("@/lib/prisma", () => {
  const base = jest.requireActual<{ default: Record<string, unknown> }>(
    "@/__mocks__/prisma-mock.js",
  );
  const versionDelegate = {
    ...(base.default.knowledgeFoundationVersion as Record<string, unknown>),
    findMany: mockFindManyVersions,
    findUniqueOrThrow: mockFindUniqueOrThrowVersion,
    update: mockUpdateVersion,
    updateMany: mockUpdateManyVersion,
  };
  const junctionDelegate = {
    ...(base.default.knowledgeFoundationVersionCandidate as Record<string, unknown>),
    updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    count: jest.fn().mockResolvedValue(0),
    findMany: jest.fn().mockResolvedValue([]),
  };
  mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn({
      knowledgeFoundationVersionCandidate: junctionDelegate,
      knowledgeFoundationVersion: versionDelegate,
      knowledgeFoundationRelease: {
        create: mockReleaseCreate,
      },
    }),
  );
  const prismaClient = {
    ...base.default,
    knowledgeFoundationVersion: versionDelegate,
    knowledgeFoundationVersionCandidate: junctionDelegate,
    knowledgeFoundationRelease: {
      create: mockReleaseCreate,
      update: mockReleaseUpdate,
    },
    $transaction: mockTransaction,
  };
  return {
    __esModule: true,
    default: prismaClient,
    prisma: prismaClient,
  };
});

import { generateReleasePackage } from "@/lib/knowledge-foundation/release-generator";
import { activateVersion, getVersions } from "@/lib/knowledge-foundation/kf-service";

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

function makeVersionRow(
  id: string,
  status: string,
  versionNumber: string,
) {
  return {
    id,
    versionNumber,
    status,
    candidateCount: 0,
    createdById: "user-1",
    approvedById: null,
    activatedAt: null,
    createdAt: new Date("2026-01-01"),
    rollbackVersionId: null,
    notes: null,
    createdBy: { id: "user-1", name: "Creator" },
    approvedBy: null,
  };
}

describe("Phase 27 hotfix — release status", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "OPERATOR" }));
    mockFindUniqueOrThrowVersion.mockResolvedValue({
      id: "kfv-approved",
      versionNumber: "1.0.0",
      status: "APPROVED",
    });
    mockUpdateVersion.mockImplementation((args: { data: Record<string, unknown> }) => ({
      id: "kfv-approved",
      ...args.data,
    }));
    mockReleaseCreate.mockResolvedValue({ id: "kfr-1" });
    mockReleaseUpdate.mockResolvedValue({ id: "kfr-1", artifactStatus: "COMPLETE" });
  });

  it("sets status RELEASED after generateReleasePackage (APPROVED → RELEASED)", async () => {
    await generateReleasePackage({
      versionId: "kfv-approved",
      versionNumber: "1.0.0",
      actorId: "user-1",
    });

    expect(mockUpdateVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "kfv-approved" },
        data: expect.objectContaining({ status: "RELEASED" }),
      }),
    );
  });
});

describe("Phase 27 hotfix — activate after release", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "ADMIN" }));
    mockFindUniqueOrThrowVersion.mockResolvedValue({
      id: "kfv-released",
      versionNumber: "1.0.0",
      status: "RELEASED",
    });
    mockUpdateManyVersion.mockResolvedValue({ count: 0 });
    mockUpdateVersion.mockImplementation((args: { data: Record<string, unknown> }) => ({
      id: "kfv-released",
      versionNumber: "1.0.0",
      ...args.data,
    }));
  });

  it("activates a RELEASED version (RELEASED → ACTIVE)", async () => {
    const result = await activateVersion({ versionId: "kfv-released" });

    expect(result.status).toBe("ACTIVE");
    expect(mockUpdateVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "kfv-released" },
        data: expect.objectContaining({ status: "ACTIVE" }),
      }),
    );
  });
});

describe("Phase 27 hotfix — version list RBAC", () => {
  const allVersions = [
    makeVersionRow("v-draft", "DRAFT", "0.1.0"),
    makeVersionRow("v-approved", "APPROVED", "0.2.0"),
    makeVersionRow("v-released", "RELEASED", "0.3.0"),
    makeVersionRow("v-active", "ACTIVE", "1.0.0"),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFindManyVersions.mockResolvedValue(allVersions);
  });

  it("VIEWER cannot see DRAFT versions", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "VIEWER" }));

    const result = await getVersions();

    expect(result.some((v) => v.status === "DRAFT")).toBe(false);
  });

  it("VIEWER cannot see APPROVED versions", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "VIEWER" }));

    const result = await getVersions();

    expect(result.some((v) => v.status === "APPROVED")).toBe(false);
  });

  it("ADMIN can see all versions", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "ADMIN" }));

    const result = await getVersions();

    expect(result).toHaveLength(4);
    expect(result.map((v) => v.status).sort()).toEqual(
      ["ACTIVE", "APPROVED", "DRAFT", "RELEASED"].sort(),
    );
  });
});
