/**
 * Phase 28.1 — Foundation bridge server action RBAC tests.
 */

import { jest } from "@jest/globals";

const mockGetCurrentUser = jest.fn<() => Promise<Record<string, unknown>>>();

jest.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
}));

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

jest.mock("@/lib/knowledge-foundation/candidate-bridge", () => ({
  listEligiblePromotedCandidates: jest.fn().mockResolvedValue([]),
  bindCandidatesToVersion: jest.fn().mockResolvedValue({ bound: 1, candidateCount: 1 }),
  unbindCandidateFromVersion: jest.fn().mockResolvedValue({ candidateCount: 0 }),
  listBoundCandidates: jest.fn().mockResolvedValue([]),
}));

jest.mock("@/lib/knowledge-foundation/provenance-manifest", () => ({
  buildVersionProvenanceManifest: jest.fn().mockResolvedValue({ candidateCount: 0 }),
}));

import {
  getEligibleFoundationCandidates,
  bindFoundationCandidates,
  unbindFoundationCandidate,
} from "@/actions/knowledge-foundation/actions";

describe("foundation bridge actions RBAC", () => {
  it("denies VIEWER from listing eligible candidates", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "u1", role: "VIEWER" });
    await expect(getEligibleFoundationCandidates()).rejects.toThrow(/OPERATOR/);
  });

  it("allows OPERATOR to bind candidates", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "u1", role: "OPERATOR" });
    const result = await bindFoundationCandidates({
      versionId: "kfv-1",
      candidateIds: ["kc-1"],
    });
    expect(result.bound).toBe(1);
  });

  it("denies VIEWER from unbinding", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: "u1", role: "VIEWER" });
    await expect(
      unbindFoundationCandidate({ versionId: "kfv-1", candidateId: "kc-1" }),
    ).rejects.toThrow(/OPERATOR/);
  });
});
