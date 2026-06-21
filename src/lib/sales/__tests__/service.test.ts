// @ts-nocheck
import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import type { CurrentUser } from "@/lib/auth";
import {
  createAccount,
  ensureSalesSeed,
  getAccount,
  getOpportunity,
  linkEvidence,
  listAccounts,
  listEvidenceForOpportunity,
  resetSalesStoreForTests,
  updateOpportunity,
} from "../store";
import {
  createSalesAccount,
  getSalesOpportunityDetail,
  linkOpportunityEvidence,
  submitOpportunityForReview,
  approveOpportunity,
} from "../service";
import {
  salesosBriefMetadata,
  salesosCanExportBrief,
  salesosGovernedAIContext,
} from "../core-adoption";

jest.mock("@/lib/platform/integration/core-adoption-enforcer", () => ({
  enforceCoreOnMutation: jest.fn(),
}));

const ORG = "org-test-sales";
const USER: CurrentUser = {
  id: "user-sales-001",
  email: "sales@test.example",
  name: "Sales Tester",
  role: "OPERATOR",
  organizationId: ORG,
};

describe("SalesOS store — account CRUD", () => {
  beforeEach(() => {
    resetSalesStoreForTests();
  });

  it("creates and retrieves an account scoped to organization", () => {
    const account = createAccount({
      organizationId: ORG,
      name: "Test Corp",
      status: "prospect",
      ownerId: USER.id,
      createdById: USER.id,
    });

    expect(account.id).toMatch(/^sales-acct-/);
    expect(listAccounts(ORG)).toHaveLength(1);
    expect(getAccount(ORG, account.id)?.name).toBe("Test Corp");
    expect(getAccount("other-org", account.id)).toBeUndefined();
  });

  it("seeds demo data for a new organization", async () => {
    await ensureSalesSeed(ORG, USER.id);
    const accounts = listAccounts(ORG);
    expect(accounts.length).toBeGreaterThanOrEqual(3);
  });
});

describe("SalesOS service — opportunity lifecycle", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG, USER.id);
  });

  it("submits opportunity for review and transitions stage", async () => {
    linkEvidence({
      organizationId: ORG,
      opportunityId: "sales-opp-001",
      typeId: "qualification_note",
      label: "Discovery notes",
      linkedById: USER.id,
    });

    const updated = await submitOpportunityForReview(USER, "sales-opp-001");
    expect(updated.stage).toBe("InReview");
    expect(updated.reviewStatus).toBe("InReview");
  });

  it("approves opportunity after review", async () => {
    linkEvidence({
      organizationId: ORG,
      opportunityId: "sales-opp-002",
      typeId: "qualification_note",
      label: "Proposal draft",
      linkedById: USER.id,
    });

    const admin: CurrentUser = { ...USER, role: "ADMIN" };
    const updated = await approveOpportunity(admin, "sales-opp-002");
    expect(updated.stage).toBe("Approved");
    expect(updated.approvalStatus).toBe("Approved");
  });

  it("rejects evidence type invalid for SalesOS", () => {
    expect(() =>
      linkOpportunityEvidence(USER, "sales-opp-001", "invalid_type", "Bad"),
    ).toThrow("Invalid evidence type for SalesOS");
  });
});

describe("SalesOS service — evidence linking", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG, USER.id);
  });

  it("links valid evidence to opportunity", async () => {
    const ref = await linkOpportunityEvidence(
      USER,
      "sales-opp-001",
      "qualification_note",
      "Q1 qualification summary",
    );
    expect(ref.typeId).toBe("qualification_note");
    const evidence = listEvidenceForOpportunity(ORG, "sales-opp-001");
    expect(evidence.some((e) => e.id === ref.id)).toBe(true);
  });
});

describe("SalesOS service — review package and export gate", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG, USER.id);
  });

  it("builds review package with evidence completeness", async () => {
    linkEvidence({
      organizationId: ORG,
      opportunityId: "sales-opp-001",
      typeId: "qualification_note",
      label: "Notes",
      linkedById: USER.id,
    });

    const detail = await getSalesOpportunityDetail(USER, "sales-opp-001");
    expect(detail).not.toBeNull();
    expect(detail!.reviewPackage.evidenceComplete).toBe(true);
    expect(detail!.exportGate).toBe(false);
  });

  it("blocks export until approved", () => {
    expect(salesosCanExportBrief("Draft")).toBe(false);
    expect(salesosCanExportBrief("Approved")).toBe(true);
  });
});

describe("SalesOS core-adoption — governed AI and output metadata", () => {
  it("builds governed AI contract with human review required", () => {
    const contract = salesosGovernedAIContext({
      useCase: "commercial_claim_review",
      organizationId: ORG,
      userId: USER.id,
      opportunityId: "sales-opp-001",
    });
    expect(contract.useCase).toBe("commercial_claim_review");
    expect(contract.policyTags).toContain("human_review_required");
    expect(contract.outputStatus).toBe("pending_review");
  });

  it("builds account brief output metadata with bilingual titles", () => {
    const meta = salesosBriefMetadata({
      accountName: "Acme Corp",
      organizationName: "Test Org",
      reviewStatus: "Approved",
      approvalStatus: "Approved",
      generatedBy: USER.name,
    });
    expect(meta.title).toContain("Acme Corp");
    expect(meta.titleAr).toContain("Acme Corp");
    expect(meta.disclaimer).toBeTruthy();
  });
});

describe("SalesOS service — account creation via service layer", () => {
  beforeEach(() => {
    resetSalesStoreForTests();
  });

  it("creates account through service with audit hooks", async () => {
    const account = await createSalesAccount(USER, {
      name: "New Enterprise",
      industry: "Energy",
    });
    expect(account.name).toBe("New Enterprise");
    expect(getAccount(ORG, account.id)).toBeDefined();
  });
});

describe("SalesOS store — opportunity patch", () => {
  beforeEach(async () => {
    resetSalesStoreForTests();
    await ensureSalesSeed(ORG, USER.id);
  });

  it("updates opportunity fields tenant-safely", () => {
    const updated = updateOpportunity(ORG, "sales-opp-003", {
      stage: "Qualification",
      qualificationScore: 65,
    });
    expect(updated?.stage).toBe("Qualification");
    expect(updated?.qualificationScore).toBe(65);
    expect(getOpportunity("other-org", "sales-opp-003")).toBeUndefined();
  });
});
