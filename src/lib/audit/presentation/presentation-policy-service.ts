import "server-only";

import { prisma } from "@/lib/prisma";
import {
  BUILTIN_PRESENTATION_POLICIES,
  GENERIC_PRESENTATION_POLICY_V1,
  getBuiltinPolicyBySlug,
  parsePresentationPolicyRules,
  type PresentationPolicyRules,
} from "@/lib/audit/presentation/presentation-policy-types";

export type PresentationPolicySummary = {
  id: string;
  slug: string;
  name: string;
  version: string;
  isSystem: boolean;
  organizationId: string | null;
};

export type PresentationPolicyEditableFields = {
  name?: string;
  revenueOperatingExclusionGlCodes?: string[];
  costOfRevenueExclusionGlCodes?: string[];
  costOfRevenueExclusionPrefixPatterns?: string[];
  otherIncomeTargetNet?: number | null;
  otherIncomeMiscNettingGlCode?: string | null;
  financeNetOffset?: number | null;
  useAuditedHeadlineRules?: boolean;
  useOperatingRevenueLabel?: boolean;
};

function toSummary(row: {
  id: string;
  slug: string;
  name: string;
  version: string;
  isSystem: boolean;
  organizationId: string | null;
}): PresentationPolicySummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    version: row.version,
    isSystem: row.isSystem,
    organizationId: row.organizationId,
  };
}

export async function listPresentationPoliciesForOrganization(
  organizationId: string,
): Promise<PresentationPolicySummary[]> {
  const rows = await prisma.auditPresentationPolicy.findMany({
    where: {
      OR: [{ isSystem: true }, { organizationId }],
    },
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      version: true,
      isSystem: true,
      organizationId: true,
    },
  });
  return rows.map(toSummary);
}

export async function getPresentationPolicyRulesById(
  policyId: string,
): Promise<PresentationPolicyRules | null> {
  const row = await prisma.auditPresentationPolicy.findUnique({
    where: { id: policyId },
    select: { rules: true },
  });
  return parsePresentationPolicyRules(row?.rules);
}

function slugifyBase(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export async function createOrgPresentationPolicyFromTemplate(params: {
  organizationId: string;
  templateSlug: string;
  name: string;
}): Promise<PresentationPolicySummary> {
  let baseRules: PresentationPolicyRules | null =
    getBuiltinPolicyBySlug(params.templateSlug);

  if (!baseRules) {
    const row = await prisma.auditPresentationPolicy.findFirst({
      where: {
        slug: params.templateSlug,
        OR: [{ isSystem: true }, { organizationId: params.organizationId }],
      },
    });
    baseRules = parsePresentationPolicyRules(row?.rules);
  }

  if (!baseRules) {
    baseRules = GENERIC_PRESENTATION_POLICY_V1;
  }

  const slugBase = slugifyBase(params.name) || "custom-policy";
  const slug = `${slugBase}-${Date.now()}`;
  const id = `pol-${slugBase}-${Date.now()}`;

  const rules: PresentationPolicyRules = {
    ...baseRules,
    slug,
    name: params.name,
    version: `${slugBase}-v1`,
  };

  const created = await prisma.auditPresentationPolicy.create({
    data: {
      id,
      slug,
      name: params.name,
      version: rules.version,
      rules: rules as object,
      isSystem: false,
      organizationId: params.organizationId,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      version: true,
      isSystem: true,
      organizationId: true,
    },
  });

  return toSummary(created);
}

function mergeEditableFields(
  existing: PresentationPolicyRules,
  fields: PresentationPolicyEditableFields,
): PresentationPolicyRules {
  return {
    ...existing,
    name: fields.name ?? existing.name,
    revenue: {
      ...existing.revenue,
      operatingExclusionGlCodes:
        fields.revenueOperatingExclusionGlCodes ??
        existing.revenue.operatingExclusionGlCodes,
    },
    costOfRevenue: {
      ...existing.costOfRevenue,
      exclusionGlCodes:
        fields.costOfRevenueExclusionGlCodes ??
        existing.costOfRevenue.exclusionGlCodes,
      exclusionPrefixPatterns:
        fields.costOfRevenueExclusionPrefixPatterns ??
        existing.costOfRevenue.exclusionPrefixPatterns,
    },
    otherIncome: {
      ...existing.otherIncome,
      targetNet:
        fields.otherIncomeTargetNet !== undefined
          ? fields.otherIncomeTargetNet
          : existing.otherIncome.targetNet,
      miscNettingGlCode:
        fields.otherIncomeMiscNettingGlCode !== undefined
          ? fields.otherIncomeMiscNettingGlCode
          : existing.otherIncome.miscNettingGlCode,
    },
    finance: {
      ...existing.finance,
      netOffset:
        fields.financeNetOffset !== undefined
          ? fields.financeNetOffset
          : existing.finance.netOffset,
    },
    headline: {
      useAuditedHeadlineRules:
        fields.useAuditedHeadlineRules ??
        existing.headline.useAuditedHeadlineRules,
      useOperatingRevenueLabel:
        fields.useOperatingRevenueLabel ??
        existing.headline.useOperatingRevenueLabel,
    },
  };
}

export async function updateOrgPresentationPolicy(params: {
  organizationId: string;
  policyId: string;
  fields: PresentationPolicyEditableFields;
}): Promise<PresentationPolicySummary> {
  const existing = await prisma.auditPresentationPolicy.findFirst({
    where: {
      id: params.policyId,
      isSystem: false,
      organizationId: params.organizationId,
    },
  });

  if (!existing) {
    throw new Error("Policy not found or not editable");
  }

  const rules = parsePresentationPolicyRules(existing.rules);
  if (!rules) {
    throw new Error("Invalid policy rules in database");
  }

  const merged = mergeEditableFields(rules, params.fields);

  const updated = await prisma.auditPresentationPolicy.update({
    where: { id: params.policyId },
    data: {
      name: merged.name,
      rules: merged as object,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      version: true,
      isSystem: true,
      organizationId: true,
    },
  });

  return toSummary(updated);
}

export async function assignPresentationPolicyToEngagement(params: {
  organizationId: string;
  engagementId: string;
  policyId: string;
}): Promise<void> {
  const policy = await prisma.auditPresentationPolicy.findFirst({
    where: {
      id: params.policyId,
      OR: [{ isSystem: true }, { organizationId: params.organizationId }],
    },
  });

  if (!policy) {
    throw new Error("Presentation policy not found");
  }

  const engagement = await prisma.auditEngagement.findFirst({
    where: {
      id: params.engagementId,
      organizationId: params.organizationId,
    },
  });

  if (!engagement) {
    throw new Error("Engagement not found");
  }

  await prisma.auditEngagement.update({
    where: { id: params.engagementId },
    data: { presentationPolicyId: params.policyId },
  });
}

/** Resolve template slugs for admin UI clone dropdown. */
export function listPresentationPolicyTemplates(): PresentationPolicyRules[] {
  return BUILTIN_PRESENTATION_POLICIES;
}
