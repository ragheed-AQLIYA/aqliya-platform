import "server-only";

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import {
  EXECUTABLE_SOCPA_TOPICS,
  type SocpaKnowledgeRule,
} from "./types";

let cachedRules: SocpaKnowledgeRule[] | null = null;

type RulesPack = {
  meta?: {
    standardCode?: string;
    versionLabel?: string;
    reviewStatus?: string;
    jurisdiction?: string;
  };
  rules?: Array<{
    ruleId: string;
    paragraphReference: string;
    ruleText: string;
    topic: string;
    confidenceScore?: number;
    jurisdiction?: string;
  }>;
};

export function loadSocpaKnowledgeRules(): SocpaKnowledgeRule[] {
  if (cachedRules) return cachedRules;

  const baseDir = join(process.cwd(), "knowledge-foundation", "domains", "socpa");
  const packs: SocpaKnowledgeRule[] = [];

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
      const packJurisdiction = pack.meta?.jurisdiction ?? "saudi-arabia";

      for (const rule of pack.rules ?? []) {
        if (!EXECUTABLE_SOCPA_TOPICS.has(rule.topic)) continue;
        packs.push({
          ruleId: rule.ruleId,
          paragraphReference: rule.paragraphReference,
          ruleText: rule.ruleText,
          topic: rule.topic,
          standardCode,
          versionLabel,
          confidenceScore: rule.confidenceScore,
          jurisdiction: rule.jurisdiction ?? packJurisdiction,
        });
      }
    } catch {
      // skip unreadable packs
    }
  }

  cachedRules = packs;
  return cachedRules;
}

export function clearSocpaRulesCache(): void {
  cachedRules = null;
}
