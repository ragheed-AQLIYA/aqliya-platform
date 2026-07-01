/**
 * Phase 28.1 hotfix — R5 delete/binding governance tests.
 */

import { jest } from "@jest/globals";

const bindingStore: Array<{
  candidateId: string;
  version: { id: string; versionNumber: string; status: string };
}> = [];

let deleteCalled = false;

jest.mock("@/lib/prisma", () => ({
  prisma: {
    knowledgeFoundationVersionCandidate: {
      findFirst: async ({ where }: { where: { candidateId: string } }) =>
        bindingStore.find((b) => b.candidateId === where.candidateId) ?? null,
    },
    knowledgeCandidate: {
      delete: async () => {
        deleteCalled = true;
      },
    },
  },
}));

import { deleteCandidate } from "@/lib/tb-intelligence/knowledge-mining/knowledge-candidate-service";

describe("deleteCandidate — R5 binding governance", () => {
  beforeEach(() => {
    bindingStore.length = 0;
    deleteCalled = false;
  });

  it("rejects deletion when candidate is bound to a foundation version", async () => {
    bindingStore.push({
      candidateId: "kc-bound",
      version: {
        id: "kfv-1",
        versionNumber: "1.2.0",
        status: "DRAFT",
      },
    });

    await expect(deleteCandidate("kc-bound")).rejects.toThrow(
      /Cannot delete candidate\. It is bound to Foundation Version/,
    );
    expect(deleteCalled).toBe(false);
  });

  it("allows deletion when candidate is not bound", async () => {
    const result = await deleteCandidate("kc-free");

    expect(result).toBe(true);
    expect(deleteCalled).toBe(true);
  });

  it("error message includes foundation version number for DRAFT binding", async () => {
    bindingStore.push({
      candidateId: "kc-draft-bound",
      version: {
        id: "kfv-draft",
        versionNumber: "2.0.0-draft",
        status: "DRAFT",
      },
    });

    await expect(deleteCandidate("kc-draft-bound")).rejects.toThrow(
      "Cannot delete candidate. It is bound to Foundation Version 2.0.0-draft (DRAFT). Unbind first.",
    );
    expect(deleteCalled).toBe(false);
  });
});
