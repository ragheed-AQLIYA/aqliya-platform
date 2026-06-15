import "server-only";

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import {
  EXECUTABLE_IFRS_TOPICS,
  type IfrsKnowledgeRule,
} from "./types";

let cachedRules: IfrsKnowledgeRule[] | null = null;

type RulesPack = {
  meta?: {
    standardCode?: string;
    versionLabel?: string;
    reviewStatus?: string;
  };
  rules?: Array<{
    ruleId: string;
    paragraphReference: string;
    ruleText: string;
    topic: string;
    confidenceScore?: number;
  }>;
};

export function loadIfrsKnowledgeRules(): IfrsKnowledgeRule[] {
  if (cachedRules) return cachedRules;

  const baseDir = join(process.cwd(), "knowledge-foundation", "domains", "ifrs");
  const packs: IfrsKnowledgeRule[] = [];

  let dirs: string[] = [];
  try {
    dirs = readdirSync(baseDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    cachedRules = [];
    return cachedRules;
  }

  for (const dir of dirs) {
    const rulesPath = join(baseDir, dir, "rules.json");
    try {
      const raw = readFileSync(rulesPath, "utf8");
      const pack = JSON.parse(raw) as RulesPack;
      if (pack.meta?.reviewStatus && pack.meta.reviewStatus !== "approved") {
        continue;
      }
      const standardCode = pack.meta?.standardCode ?? dir.toUpperCase();
      const versionLabel = pack.meta?.versionLabel;

      for (const rule of pack.rules ?? []) {
        if (!EXECUTABLE_IFRS_TOPICS.has(rule.topic)) continue;
        packs.push({
          ruleId: rule.ruleId,
          paragraphReference: rule.paragraphReference,
          ruleText: rule.ruleText,
          topic: rule.topic,
          standardCode,
          versionLabel,
          confidenceScore: rule.confidenceScore,
        });
      }
    } catch {
      // skip unreadable packs
    }
  }

  cachedRules = packs;
  return cachedRules;
}

/** Test helper */
export function clearIfrsRulesCache(): void {
  cachedRules = null;
}
