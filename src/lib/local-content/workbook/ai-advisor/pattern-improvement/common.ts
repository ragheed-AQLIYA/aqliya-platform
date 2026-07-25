import type { WorkbookTemplateLine, TbLine } from "../common";

export interface PatternSuggestion {
  workbookLineCode: string;
  currentPattern: string;
  suggestedPattern: string;
  reasoning: string;
  falsePositiveAccounts: string[];
  unmatchedAccounts: string[];
  confidence: number;
}

/** Extract meaningful terms from account names for pattern suggestions */
export function extractCommonTerms(names: string[]): string[] {
  const stopWords = new Set([
    "account", "حساب", "ال", "و", "ب", "ل", "في", "من", "على",
    "note", "ملاحظة", "statement", "كشف",
  ]);

  const termCounts = new Map<string, number>();

  for (const name of names) {
    const words = name.split(/[\s\-_/]+/);
    for (const word of words) {
      const clean = word.replace(/[^\w\u0600-\u06FF]/g, "").toLowerCase();
      if (clean.length > 2 && !stopWords.has(clean)) {
        termCounts.set(clean, (termCounts.get(clean) || 0) + 1);
      }
    }
  }

  return Array.from(termCounts.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([term]) => term);
}

export function reasonedFallback(
  tmpl: WorkbookTemplateLine,
  existingFPs: Array<{ accountCode: string }>,
  unmatchedAccounts: TbLine[],
  fpAccountCodes: string[],
): { suggestedPattern: string; reasoning: string } {
  const patterns = [...tmpl.tbAccountPatterns!];
  const reasoningParts: string[] = [];

  if (existingFPs.length > 0) {
    const exclusions = fpAccountCodes.map((code) => `(?!.*${code})`).join("");
    for (let i = 0; i < patterns.length; i++) {
      patterns[i] = `${exclusions}${patterns[i]}`;
    }
    reasoningParts.push(`Added ${existingFPs.length} exclusion pattern(s) for known false positive accounts`);
  }

  if (unmatchedAccounts.length >= 2) {
    const commonTerms = extractCommonTerms(unmatchedAccounts.map((a) => a.accountName));
    if (commonTerms.length > 0) {
      patterns.push(commonTerms.map((t) => `.*${t}.*`).join("|"));
      reasoningParts.push(`added ${commonTerms.length} broader pattern(s) based on unmatched account names`);
    }
  }

  return {
    suggestedPattern: patterns.join("|"),
    reasoning: reasoningParts.length > 0 ? reasoningParts.join("; ") : "No significant pattern change needed",
  };
}
