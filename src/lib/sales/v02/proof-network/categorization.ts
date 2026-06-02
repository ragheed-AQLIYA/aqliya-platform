// @ts-nocheck
import type { SalesProofAsset, SalesProofAssetType } from "../../types";
import type { ProofCommercialCategory } from "./types";

const ASSET_TYPE_CATEGORY: Record<SalesProofAssetType, ProofCommercialCategory> = {
  case_study: "roi_outcomes",
  pilot_result: "pilot_execution",
  audit_evidence: "security_compliance",
  demo_recording: "pilot_execution",
  proposal: "competitive_positioning",
  customer_quote: "customer_validation",
  benchmark: "competitive_positioning",
  objection_response: "objection_handling",
};

export const OBJECTION_CATEGORY_ASSET_TYPES: Record<string, SalesProofAssetType[]> = {
  budget: ["case_study", "benchmark", "customer_quote"],
  security: ["objection_response", "audit_evidence", "case_study"],
  timing: ["customer_quote", "proposal"],
  implementation: ["pilot_result", "demo_recording", "case_study"],
  pricing: ["benchmark", "customer_quote", "proposal"],
  change_management: ["case_study", "customer_quote", "objection_response"],
};

export const INDUSTRY_PREFERRED_ASSET_TYPES: Record<string, SalesProofAssetType[]> = {
  "Financial Services": ["case_study", "audit_evidence", "benchmark"],
  Energy: ["pilot_result", "customer_quote", "case_study"],
  Government: ["objection_response", "audit_evidence", "proposal"],
  Technology: ["demo_recording", "case_study", "pilot_result"],
  "Data Analytics": ["pilot_result", "demo_recording", "benchmark"],
};

const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  "Financial Services": ["financial", "bank", "roi", "grc"],
  Energy: ["energy", "utility", "pilot", "nec"],
  Government: ["government", "residency", "security", "rfp"],
  Technology: ["technology", "saas", "demo"],
  "Data Analytics": ["analytics", "data", "pilot"],
};

export function categorizeProofAsset(asset: SalesProofAsset): ProofCommercialCategory {
  const base = ASSET_TYPE_CATEGORY[asset.assetType] ?? "general";
  const text = `${asset.title} ${asset.description ?? ""}`.toLowerCase();
  if (text.includes("security") || text.includes("residency") || text.includes("governance")) {
    return "security_compliance";
  }
  if (text.includes("objection") || text.includes("faq")) {
    return "objection_handling";
  }
  if (text.includes("roi") || text.includes("pilot") && asset.assetType === "case_study") {
    return "roi_outcomes";
  }
  return base;
}

export function preferredAssetTypesForObjection(category: string): SalesProofAssetType[] {
  const key = category.toLowerCase().trim();
  return OBJECTION_CATEGORY_ASSET_TYPES[key] ?? ["objection_response", "case_study"];
}

export function preferredAssetTypesForIndustry(industry: string): SalesProofAssetType[] {
  return (
    INDUSTRY_PREFERRED_ASSET_TYPES[industry] ?? [
      "case_study",
      "customer_quote",
      "pilot_result",
    ]
  );
}

export function industryKeywordHints(industry: string): string[] {
  return INDUSTRY_KEYWORDS[industry] ?? [industry.toLowerCase()];
}
