/**
 * Engagement presentation policy rules — Phase 13.2.
 * All presentation intelligence lives here, not in hardcoded engine constants.
 */

export type PresentationPolicyRules = {
  slug: string;
  name: string;
  version: string;
  revenue: {
    /** GL codes excluded from operating revenue headline */
    operatingExclusionGlCodes: string[];
    /** GL codes treated as affiliate / intercompany revenue */
    affiliateGlCodes: string[];
    /** GL codes classified as contract revenue segment */
    contractRevenueGlCodes: string[];
    /** Unbilled duplicate GLs → other revenue segment */
    unbilledDuplicateGlCodes: string[];
    /** Exclude affiliate from operating headline (consolidation memo) */
    excludeAffiliateFromOperatingHeadline: boolean;
  };
  costOfRevenue: {
    exclusionGlCodes: string[];
    /** Account code prefix patterns excluded from CoR face (e.g. "33") */
    exclusionPrefixPatterns: string[];
  };
  otherIncome: {
    /** Misc netting bucket GL (presentation-only residual cap) */
    miscNettingGlCode: string | null;
    /** Target net other income when misc netting applies */
    targetNet: number | null;
  };
  finance: {
    /** Presentation net offset subtracted from finance cost gross */
    netOffset: number | null;
  };
  headline: {
    /** Use "Operating Revenue" label vs "Revenue" */
    useOperatingRevenueLabel: boolean;
    /** Apply headline exclusions / audited-style netting rules */
    useAuditedHeadlineRules: boolean;
  };
};

export type ResolvedPresentationContext = {
  presentationProfile: string;
  presentationProfileVersion: string;
  presentationPolicyId: string | null;
  policy: PresentationPolicyRules;
};

export const GENERIC_PRESENTATION_POLICY_V1: PresentationPolicyRules = {
  slug: "generic-v1",
  name: "Generic Presentation Policy",
  version: "generic-v1",
  revenue: {
    operatingExclusionGlCodes: [],
    affiliateGlCodes: ["4401010005"],
    contractRevenueGlCodes: ["4401010004"],
    unbilledDuplicateGlCodes: ["4401010003"],
    excludeAffiliateFromOperatingHeadline: false,
  },
  costOfRevenue: {
    exclusionGlCodes: [],
    exclusionPrefixPatterns: [],
  },
  otherIncome: {
    miscNettingGlCode: null,
    targetNet: null,
  },
  finance: {
    netOffset: null,
  },
  headline: {
    useOperatingRevenueLabel: false,
    useAuditedHeadlineRules: false,
  },
};

/** Shalfa Facilities pilot — TB 31-12-2025 audited FS alignment (Phase 11 evidence). */
export const SHALFA_PILOT_PRESENTATION_POLICY_V1: PresentationPolicyRules = {
  slug: "shalfa-pilot-audited-v1",
  name: "Shalfa Pilot Audited Presentation Policy",
  version: "pilot-audited-v1",
  revenue: {
    operatingExclusionGlCodes: [
      "4401010004",
      "4601010003",
      "4701010001",
    ],
    affiliateGlCodes: ["4401010005"],
    contractRevenueGlCodes: ["4401010004"],
    unbilledDuplicateGlCodes: ["4401010003"],
    excludeAffiliateFromOperatingHeadline: true,
  },
  costOfRevenue: {
    exclusionGlCodes: ["3204010028", "3204010054"],
    exclusionPrefixPatterns: ["33"],
  },
  otherIncome: {
    miscNettingGlCode: "4501010003",
    targetNet: 735_915,
  },
  finance: {
    netOffset: 334_011,
  },
  headline: {
    useOperatingRevenueLabel: true,
    useAuditedHeadlineRules: true,
  },
};

export const BUILTIN_PRESENTATION_POLICIES: PresentationPolicyRules[] = [
  GENERIC_PRESENTATION_POLICY_V1,
  SHALFA_PILOT_PRESENTATION_POLICY_V1,
];

export const PROFILE_DEFAULT_POLICY_SLUG: Record<string, string> = {
  generic: GENERIC_PRESENTATION_POLICY_V1.slug,
  "pilot-audited": SHALFA_PILOT_PRESENTATION_POLICY_V1.slug,
};

export function getBuiltinPolicyBySlug(
  slug: string,
): PresentationPolicyRules | null {
  return (
    BUILTIN_PRESENTATION_POLICIES.find((policy) => policy.slug === slug) ?? null
  );
}

export function parsePresentationPolicyRules(
  value: unknown,
): PresentationPolicyRules | null {
  if (!value || typeof value !== "object") return null;
  const rules = value as PresentationPolicyRules;
  if (!rules.slug || !rules.version || !rules.revenue || !rules.costOfRevenue) {
    return null;
  }
  return rules;
}

export function policyUsesAuditedHeadlineRules(
  policy: PresentationPolicyRules,
): boolean {
  return policy.headline.useAuditedHeadlineRules;
}
