/**
 * TB Classification Engine — ADR-001 pipeline order (single source of truth).
 */

import { isEnabled } from "@/lib/platform/feature-flags/registry";
import { generateClassification } from "@/lib/ai/generate";
import {
  lookupFirmMemory,
  logClassificationHistory,
} from "./firm-memory";
import { matchSynonym } from "./synonyms";
import { matchErpIntelligence } from "./erp-intelligence-matcher";
import { matchByPattern } from "./pattern-matcher";
import {
  classifyByPrefix,
  loadCanonicalCandidates,
} from "./coa-loader";
import { resolveFirmMemoryOrganizationId } from "./org-resolver";
import {
  buildCandidateAccountLabels,
  buildChartOfAccountsContext,
  netAccountBalance,
} from "./classification-prompt-context";
import { parseClassificationModelOutput } from "./classification-response-parser";
import type { ClassifyAccountInput, ClassificationResult, CanonicalCandidate } from "./types";

export function parseErpStatementSide(
  value: string | undefined | null,
): ClassifyAccountInput["erpStatementSide"] {
  const v = String(value ?? "")
    .toLowerCase()
    .trim();
  if (v.includes("balance sheet")) return "balance_sheet";
  if (v.includes("income statement")) return "income_statement";
  return undefined;
}

function isRouAccumulatedDepreciationName(accountName: string): boolean {
  return /مجمع.*اهلا|accumulated.*dep|acc\.?\s*dep|accum\s*dep|accumulated depreciation/i.test(
    accountName,
  );
}

function sideConflict(
  erpSide: ClassifyAccountInput["erpStatementSide"],
  candidate: CanonicalCandidate,
): boolean {
  if (!erpSide) return false;
  return candidate.statementType !== erpSide;
}

function resolveByCode(
  candidates: Awaited<ReturnType<typeof loadCanonicalCandidates>>,
  canonicalCode: string,
  confidence: number,
  source: ClassificationResult["source"],
  evidence?: string,
  tier?: string,
): ClassificationResult | null {
  const canonical = candidates.find((c) => c.code === canonicalCode);
  if (!canonical) return null;
  return {
    canonicalAccountId: canonical.id,
    canonicalCode: canonical.code,
    canonicalName: canonical.name,
    category: canonical.category,
    confidence,
    source,
    evidence,
    sourceDetail: tier ? { tier } : undefined,
    evidenceDetail: tier
      ? { matchedBy: tier, detail: evidence }
      : evidence
        ? { detail: evidence }
        : undefined,
  };
}

async function classifyByRules(
  input: ClassifyAccountInput,
  candidates: Awaited<ReturnType<typeof loadCanonicalCandidates>>,
): Promise<ClassificationResult | null> {
  const hintTexts = [
    input.accountName,
    ...(input.classificationHints ?? []),
  ].filter(Boolean);

  for (const hint of hintTexts) {
    const synonym = matchSynonym(hint, input.accountCode);
    if (!synonym) continue;

    let targetCode = synonym.canonicalCode;
    if (
      targetCode === "CA-1070" &&
      isRouAccumulatedDepreciationName(input.accountName)
    ) {
      targetCode = "CA-1071";
    }

    const resolved = resolveByCode(
      candidates,
      targetCode,
      0.88,
      "rule",
      `COA synonym match: ${synonym.alias}`,
      "synonym",
    );
    if (!resolved) continue;

    const candidate = candidates.find((c) => c.code === targetCode);
    if (candidate && sideConflict(input.erpStatementSide, candidate)) {
      continue;
    }

    return resolved;
  }

  const erpMatch = matchErpIntelligence(
    input.accountCode,
    input.accountName,
    input.classificationHints,
    candidates,
  );
  if (erpMatch) {
    const candidate = candidates.find((c) => c.code === erpMatch.canonicalCode);
    if (!candidate || !sideConflict(input.erpStatementSide, candidate)) {
      return erpMatch;
    }
  }

  const prefixCategory = classifyByPrefix(input.accountCode);
  if (prefixCategory) {
    const sameCategory = candidates.filter((c) => c.category === prefixCategory);
    if (sameCategory.length === 1) {
      const c = sameCategory[0]!;
      return {
        canonicalAccountId: c.id,
        canonicalCode: c.code,
        canonicalName: c.name,
        category: c.category,
        confidence: 0.7,
        source: "rule",
        evidence: `Prefix ${input.accountCode.substring(0, 2)} → ${prefixCategory}`,
        sourceDetail: { tier: "prefix" },
        evidenceDetail: {
          matchedBy: "prefix",
          detail: `Prefix ${input.accountCode.substring(0, 2)} → ${prefixCategory}`,
        },
      };
    }
  }

  return null;
}

async function classifyByLocalAi(
  input: ClassifyAccountInput,
  candidates: Awaited<ReturnType<typeof loadCanonicalCandidates>>,
): Promise<ClassificationResult | null> {
  if (process.env.AI_MODE === "cloud") return null;

  try {
    const candidateAccounts = buildCandidateAccountLabels(candidates);
    const response = await generateClassification({
      organizationId: input.organizationId,
      engagementId: input.engagementId,
      accountCode: input.accountCode,
      accountName: input.accountName,
      accountBalance: netAccountBalance(input),
      preferProvider: "local",
      candidateAccounts,
      chartOfAccountsContext: buildChartOfAccountsContext(candidates),
    });

    const parsed = parseClassificationModelOutput(response.output);
    if (!parsed) return null;

    const resolved = resolveByCode(
      candidates,
      parsed.accountCode,
      Math.max(0.6, parsed.confidence ?? response.confidence),
      "local",
      parsed.reasoning || "Local Ollama classification",
      "local_ai",
    );
    if (resolved) resolved.providerId = response.providerId;
    return resolved;
  } catch {
    return null;
  }
}

async function classifyByCloudAi(
  input: ClassifyAccountInput,
  candidates: Awaited<ReturnType<typeof loadCanonicalCandidates>>,
): Promise<ClassificationResult | null> {
  if (!input.enableCloudAi && !isEnabled("ai.real-providers")) {
    return null;
  }

  try {
    const candidateAccounts = buildCandidateAccountLabels(candidates);
    const response = await generateClassification({
      organizationId: input.organizationId,
      engagementId: input.engagementId,
      accountCode: input.accountCode,
      accountName: input.accountName,
      accountBalance: netAccountBalance(input),
      candidateAccounts,
      chartOfAccountsContext: buildChartOfAccountsContext(candidates),
    });

    const parsed = parseClassificationModelOutput(response.output);
    if (!parsed) return null;

    const resolved = resolveByCode(
      candidates,
      parsed.accountCode,
      Math.max(0.6, parsed.confidence ?? response.confidence),
      "cloud",
      parsed.reasoning || "Cloud LLM classification",
      "cloud_ai",
    );
    if (resolved) {
      resolved.providerId = response.providerId;
    }
    return resolved;
  } catch {
    return null;
  }
}

/** ADR-001 ordered pipeline */
function logResult(
  input: ClassifyAccountInput,
  result: ClassificationResult,
): Promise<void> {
  return logClassificationHistory({
    organizationId: input.organizationId,
    engagementId: input.engagementId,
    accountCode: input.accountCode,
    accountName: input.accountName,
    result,
    mappingHints: input.classificationHints,
  });
}

export async function classifyTrialBalanceAccount(
  input: ClassifyAccountInput,
): Promise<ClassificationResult | null> {
  const candidates = await loadCanonicalCandidates();

  // Step 1: Firm Memory (Phase 3C — audit knowledge reuse)
  const memory = await lookupFirmMemory(
    input.organizationId,
    input.accountCode,
    input.accountName,
    input.classificationHints,
  );
  if (memory) {
    await logResult(input, memory);
    return memory;
  }

  // Step 2: COA Rules Engine
  const rules = await classifyByRules(input, candidates);
  if (rules) {
    await logResult(input, rules);
    return rules;
  }

  // Step 3: Pattern Matching
  const pattern = await matchByPattern(
    input.organizationId,
    input.accountCode,
    input.accountName,
    candidates,
  );
  if (pattern) {
    await logResult(input, pattern);
    return pattern;
  }

  // Step 4: Local AI (Cycle 2+)
  const local = await classifyByLocalAi(input, candidates);
  if (local) {
    await logResult(input, local);
    return local;
  }

  // Step 5: Cloud AI
  const cloud = await classifyByCloudAi(input, candidates);
  if (cloud) {
    await logResult(input, cloud);
    return cloud;
  }

  return null;
}

export async function classifyTrialBalanceRows(
  organizationId: string,
  engagementId: string,
  rows: Array<{
    accountCode: string;
    accountName: string;
    debitAmount: number;
    creditAmount: number;
    classificationHints?: string[];
    erpStatementSide?: "balance_sheet" | "income_statement";
  }>,
  options?: { enableCloudAi?: boolean },
): Promise<
  Array<{
    row: (typeof rows)[number];
    classification: ClassificationResult | null;
  }>
> {
  const resolvedOrgId =
    (await resolveFirmMemoryOrganizationId(organizationId)) ?? organizationId;

  const results = [];
  for (const row of rows) {
    const classification = await classifyTrialBalanceAccount({
      organizationId: resolvedOrgId,
      engagementId,
      accountCode: row.accountCode,
      accountName: row.accountName,
      debitAmount: row.debitAmount,
      creditAmount: row.creditAmount,
      classificationHints: row.classificationHints,
      erpStatementSide: row.erpStatementSide,
      enableCloudAi: options?.enableCloudAi,
    });
    results.push({ row, classification });
  }
  return results;
}

/** Firm memory only — Phase 3C validation / Year-2 reuse simulation. */
export async function classifyAccountFirmMemoryOnly(
  input: ClassifyAccountInput,
): Promise<ClassificationResult | null> {
  return lookupFirmMemory(
    input.organizationId,
    input.accountCode,
    input.accountName,
    input.classificationHints,
  );
}

/** Validation / benchmark entry points — no firm memory, no audit logging. */
export async function classifyAccountRulesOnly(
  input: ClassifyAccountInput,
  candidates?: Awaited<ReturnType<typeof loadCanonicalCandidates>>,
): Promise<ClassificationResult | null> {
  const list = candidates ?? (await loadCanonicalCandidates());
  return classifyByRules(input, list);
}

export async function classifyAccountLocalOnly(
  input: ClassifyAccountInput,
  candidates?: Awaited<ReturnType<typeof loadCanonicalCandidates>>,
): Promise<ClassificationResult | null> {
  const list = candidates ?? (await loadCanonicalCandidates());
  return classifyByLocalAi(input, list);
}

export async function classifyAccountHybridOnly(
  input: ClassifyAccountInput,
  candidates?: Awaited<ReturnType<typeof loadCanonicalCandidates>>,
): Promise<ClassificationResult | null> {
  const list = candidates ?? (await loadCanonicalCandidates());
  const rules = await classifyByRules(input, list);
  if (rules) return rules;
  const pattern = await matchByPattern(
    input.organizationId,
    input.accountCode,
    input.accountName,
    list,
  );
  if (pattern) return pattern;
  return classifyByLocalAi(input, list);
}

/** Rules + pattern only — no Local AI (fast Phase 3B re-benchmark). */
export async function classifyAccountDeterministicHybridOnly(
  input: ClassifyAccountInput,
  candidates?: Awaited<ReturnType<typeof loadCanonicalCandidates>>,
): Promise<ClassificationResult | null> {
  const list = candidates ?? (await loadCanonicalCandidates());
  const rules = await classifyByRules(input, list);
  if (rules) return rules;
  return matchByPattern(
    input.organizationId,
    input.accountCode,
    input.accountName,
    list,
  );
}
