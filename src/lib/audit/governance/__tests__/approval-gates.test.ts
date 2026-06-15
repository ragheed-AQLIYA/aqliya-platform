import { evaluateFactoryApprovalGates } from "@/lib/audit/governance/approval-gates";
import { formatRuleCitationMarker } from "@/lib/audit/notes/disclosure-types";
import { INTELLIGENCE_ENRICHMENT_MARKER } from "@/lib/audit/intelligence/types";
import { isApprovalGatesEnabled } from "@/lib/audit/governance";

describe("evaluateFactoryApprovalGates", () => {
  it("passes when all factory gates satisfied", () => {
    const result = evaluateFactoryApprovalGates({
      notes: [
        {
          id: "n1",
          title: "Tax",
          status: "approved",
          content: "approved note",
          missingInformation: [
            formatRuleCitationMarker({
              source: "socpa",
              ruleId: "r1",
              standardCode: "SOCPA-ZT",
            }),
          ],
          aiDrafted: false,
        },
      ],
      statements: [{ id: "s1", statementType: "balance_sheet", status: "approved" }],
      validationIssues: [],
    });

    expect(result.blockingIssues).toHaveLength(0);
    expect(result.checklist.every((c) => c.passed)).toBe(true);
  });

  it("blocks when rule-linked notes are not approved", () => {
    const result = evaluateFactoryApprovalGates({
      notes: [
        {
          id: "n1",
          title: "Tax",
          status: "draft",
          content: "draft",
          missingInformation: [
            formatRuleCitationMarker({
              source: "ifrs",
              ruleId: "r1",
              standardCode: "IFRS 15",
            }),
          ],
          aiDrafted: true,
        },
      ],
      statements: [{ id: "s1", statementType: "income_statement", status: "approved" }],
      validationIssues: [],
    });

    expect(result.blockingIssues.length).toBeGreaterThan(0);
    expect(
      result.checklist.find((c) => c.gateId === "factory-disclosure-approved")
        ?.passed,
    ).toBe(false);
  });

  it("blocks when intelligence enrichment pending review", () => {
    const result = evaluateFactoryApprovalGates({
      notes: [
        {
          id: "n1",
          title: "Tax",
          status: "needs_info",
          content: `base\n${INTELLIGENCE_ENRICHMENT_MARKER}`,
          missingInformation: [],
          aiDrafted: true,
        },
      ],
      statements: [{ id: "s1", statementType: "balance_sheet", status: "approved" }],
      validationIssues: [],
    });

    expect(
      result.checklist.find((c) => c.gateId === "factory-intelligence-reviewed")
        ?.passed,
    ).toBe(false);
  });

  it("blocks on open critical validation issues", () => {
    const result = evaluateFactoryApprovalGates({
      notes: [],
      statements: [{ id: "s1", statementType: "balance_sheet", status: "approved" }],
      validationIssues: [
        { severity: "critical", status: "open", checkType: "balance_equality" },
      ],
    });

    expect(
      result.checklist.find((c) => c.gateId === "factory-validation-clean")
        ?.passed,
    ).toBe(false);
  });
});

describe("isApprovalGatesEnabled", () => {
  const original = process.env.FF_AUDIT_APPROVAL_GATES;

  afterEach(() => {
    if (original === undefined) delete process.env.FF_AUDIT_APPROVAL_GATES;
    else process.env.FF_AUDIT_APPROVAL_GATES = original;
  });

  it("is off by default", () => {
    delete process.env.FF_AUDIT_APPROVAL_GATES;
    expect(isApprovalGatesEnabled()).toBe(false);
  });

  it("is on when FF_AUDIT_APPROVAL_GATES=true", () => {
    process.env.FF_AUDIT_APPROVAL_GATES = "true";
    expect(isApprovalGatesEnabled()).toBe(true);
  });
});
