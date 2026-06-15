import {
  PresentationProfile,
  DEFAULT_PRESENTATION_PROFILE,
  PRESENTATION_PROFILE_VERSIONS,
  presentationProfileVersionFor,
  resolveEngagementPresentationConfig,
  resolvePresentationProfile,
  resolvePresentationProfileVersion,
  isPilotAuditedProfile,
} from "@/lib/audit/presentation/presentation-profile";
import {
  GENERIC_PRESENTATION_POLICY_V1,
  SHALFA_PILOT_PRESENTATION_POLICY_V1,
} from "@/lib/audit/presentation/presentation-policy-types";
import { buildPresentationIncomeStatementTotals } from "@/lib/audit/db/income-statement-presentation";
import { buildStatementLinesFromMappings } from "@/lib/audit/db/statement-builder";

function revenueMapping(code: string, credit: number) {
  return {
    sourceAccountCode: code,
    sourceAccountName: "Revenue",
    debitAmount: 0,
    creditAmount: credit,
    status: "confirmed",
    erpMap1Label: "Revenues",
    canonicalAccount: {
      code: "CA-4010",
      name: "Revenue",
      category: "Revenue",
      statementType: "income_statement",
    },
  };
}

describe("presentation-profile domain", () => {
  it("defaults null and unknown values to generic", () => {
    expect(resolvePresentationProfile(null)).toBe(PresentationProfile.GENERIC);
    expect(resolvePresentationProfile(undefined)).toBe(
      PresentationProfile.GENERIC,
    );
    expect(resolvePresentationProfile("")).toBe(PresentationProfile.GENERIC);
    expect(resolvePresentationProfile("unknown")).toBe(
      PresentationProfile.GENERIC,
    );
    expect(DEFAULT_PRESENTATION_PROFILE).toBe(PresentationProfile.GENERIC);
  });

  it("resolves pilot-audited aliases", () => {
    expect(resolvePresentationProfile("pilot-audited")).toBe(
      PresentationProfile.PILOT_AUDITED,
    );
    expect(resolvePresentationProfile("pilot")).toBe(
      PresentationProfile.PILOT_AUDITED,
    );
  });

  it("assigns version labels per profile", () => {
    expect(presentationProfileVersionFor(PresentationProfile.GENERIC)).toBe(
      "generic-v1",
    );
    expect(
      presentationProfileVersionFor(PresentationProfile.PILOT_AUDITED),
    ).toBe("pilot-audited-v1");
    expect(PRESENTATION_PROFILE_VERSIONS[PresentationProfile.GENERIC]).toBe(
      "generic-v1",
    );
  });

  it("persists stored version when provided", () => {
    expect(
      resolvePresentationProfileVersion(
        PresentationProfile.GENERIC,
        "generic-v1",
      ),
    ).toBe("generic-v1");
    expect(
      resolvePresentationProfileVersion(
        PresentationProfile.PILOT_AUDITED,
        null,
      ),
    ).toBe("pilot-audited-v1");
  });

  it("builds engagement config from nullable engagement fields", () => {
    expect(resolveEngagementPresentationConfig(null)).toEqual({
      presentationProfile: PresentationProfile.GENERIC,
      presentationProfileVersion: "generic-v1",
    });
    expect(
      resolveEngagementPresentationConfig({
        presentationProfile: "pilot-audited",
        presentationProfileVersion: "pilot-audited-v1",
      }),
    ).toEqual({
      presentationProfile: PresentationProfile.PILOT_AUDITED,
      presentationProfileVersion: "pilot-audited-v1",
    });
  });

  it("does not read process.env for presentation profile", () => {
    const previous = process.env.AUDITOS_IS_PRESENTATION_PROFILE;
    process.env.AUDITOS_IS_PRESENTATION_PROFILE = "pilot-audited";
    expect(resolvePresentationProfile(null)).toBe(PresentationProfile.GENERIC);
    process.env.AUDITOS_IS_PRESENTATION_PROFILE = previous;
  });
});

describe("presentation profile wiring", () => {
  const rows = [
    revenueMapping("4401010001", 1_000_000),
    revenueMapping("4401010004", 200_000),
  ];

  it("generic policy includes excluded pilot GL in revenue total", () => {
    const totals = buildPresentationIncomeStatementTotals(
      rows,
      GENERIC_PRESENTATION_POLICY_V1,
    );
    expect(totals.revenueTotal).toBe(1_200_000);
  });

  it("shalfa policy excludes audited reclass GL from headline revenue", () => {
    const totals = buildPresentationIncomeStatementTotals(
      rows,
      SHALFA_PILOT_PRESENTATION_POLICY_V1,
    );
    expect(totals.revenueTotal).toBe(1_000_000);
  });

  it("statement builder uses engagement policy option", () => {
    const genericLines = buildStatementLinesFromMappings(
      "fs-is-generic",
      "income_statement",
      rows as never[],
      { presentationPolicy: GENERIC_PRESENTATION_POLICY_V1 },
    );
    const pilotLines = buildStatementLinesFromMappings(
      "fs-is-pilot",
      "income_statement",
      rows as never[],
      { presentationPolicy: SHALFA_PILOT_PRESENTATION_POLICY_V1 },
    );
    const genericRevenue = genericLines.find((l) => l.label === "Revenue");
    const pilotRevenue = pilotLines.find((l) => l.label === "Operating Revenue");
    expect(genericRevenue?.amount).toBe(1_200_000);
    expect(pilotRevenue?.amount).toBe(1_000_000);
  });

  it("missing profile option falls back to generic", () => {
    const lines = buildStatementLinesFromMappings(
      "fs-is-default",
      "income_statement",
      rows as never[],
    );
    expect(lines.find((l) => l.label === "Revenue")?.amount).toBe(1_200_000);
  });
});
