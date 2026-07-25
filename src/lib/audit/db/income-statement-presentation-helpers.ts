import type { PresentationPolicyRules } from "@/lib/audit/presentation/presentation-policy-types";
import { GENERIC_PRESENTATION_POLICY_V1 } from "@/lib/audit/presentation/presentation-policy-types";
import type { PresentationMapping } from "./income-statement-presentation-types";

export function normalizeMap1(value: string | null | undefined): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function policyGlSet(codes: string[]): Set<string> {
  return new Set(codes);
}

export function isGlInPolicySet(code: string, codes: string[]): boolean {
  return policyGlSet(codes).has(code);
}

export function matchesPolicyPrefix(code: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => code.startsWith(prefix));
}

export function resolveErpMap1Label(
  mapping: PresentationMapping,
  policy: PresentationPolicyRules = GENERIC_PRESENTATION_POLICY_V1,
): string | null {
  if (mapping.erpMap1Label) {
    return mapping.erpMap1Label.trim() || null;
  }

  const code = mapping.sourceAccountCode;
  const name = mapping.sourceAccountName.toLowerCase();

  if (code.startsWith("32") || code.startsWith("33")) return "Cost of revenue";
  if (/^3101020005$/i.test(code) || /zakat|zakah|زكاة/.test(name)) {
    const map1Hint = normalizeMap1(mapping.erpMap1Label ?? "");
    if (map1Hint === "zakat expense" || /^3101020005$/i.test(code)) {
      return "zakat expense";
    }
  }
  if (
    code.startsWith("310107") ||
    /finance cost|murabaha|مرابحة|فائد/.test(name)
  ) {
    return "Finance Costs";
  }
  if (
    isGlInPolicySet(code, policy.revenue.affiliateGlCodes) ||
    /شقيقة|affiliate|intercompany|inter-company/.test(name)
  ) {
    return "Affiliate revenue";
  }
  if (
    /^4[3-7]/.test(code) &&
    !isGlInPolicySet(code, policy.revenue.contractRevenueGlCodes) &&
    !isGlInPolicySet(code, policy.revenue.affiliateGlCodes)
  ) {
    return "Revenues";
  }
  if (/other income|أرباح بيع|ايرادات اخرى|استبعاد/.test(name)) {
    return "Other income";
  }
  if (
    code.startsWith("31") &&
    !code.startsWith("310102") &&
    !code.startsWith("310107")
  ) {
    return "General and administrative expenses";
  }

  return null;
}
