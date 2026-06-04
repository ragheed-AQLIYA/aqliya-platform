import { evaluateSalesBilingualParity } from "../sales-bilingual-parity";
import { SALES_CORE_ROUTES } from "../sales-ux-copy";
import { evaluateSalesL5Acceptance } from "../l5-acceptance";

describe("SalesOS bilingual parity (S7-05)", () => {
  it("manifest covers core routes including forecast and intelligence", () => {
    expect(SALES_CORE_ROUTES).toContain("/sales/intelligence");
    expect(SALES_CORE_ROUTES).toContain("/sales/forecast");
    expect(SALES_CORE_ROUTES.length).toBeGreaterThanOrEqual(16);
  });

  it("repo baseline passes parity gate", () => {
    const result = evaluateSalesBilingualParity();
    expect(result.allMet).toBe(true);
    expect(result.gaps).toHaveLength(0);
  });

  it("unblocks L5 criterion U1_BILINGUAL_RTL when paired with acceptance baseline", () => {
    const parity = evaluateSalesBilingualParity();
    expect(parity.allMet).toBe(true);
    const l5 = evaluateSalesL5Acceptance({
      G1_AUTH_WORKSPACE: true,
      G2_TENANT_RBAC: true,
      G3_AUDIT_TRAIL: true,
      G4_EVIDENCE_LINKAGE: true,
      G5_REVIEW_APPROVAL: true,
      I1_INTELLIGENCE_HUB: true,
      I2_PIPELINE_FORECAST: true,
      I3_NO_FALSE_AI_CLAIMS: true,
      U1_BILINGUAL_RTL: parity.allMet,
      C1_NO_CRM_SYNC_CLAIM: true,
      C2_OPERATOR_DISCLAIMER: true,
    });
    expect(l5.readinessLabel).toBe("L5_PILOT_READY");
  });
});
