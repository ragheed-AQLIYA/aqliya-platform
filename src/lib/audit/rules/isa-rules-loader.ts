import "server-only";

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import {
  EXECUTABLE_ISA_TOPICS,
  type IsaKnowledgeRule,
} from "./types";

let cachedRules: IsaKnowledgeRule[] | null = null;

type RulesPack = {
  meta?: {
    standardCode?: string;
    versionLabel?: string;
    reviewStatus?: string;
    executableRules?: boolean;
  };
  rules?: Array<{
    ruleId: string;
    paragraphReference: string;
    ruleText: string;
    topic: string;
    confidenceScore?: number;
  }>;
};

export function loadIsaKnowledgeRules(): IsaKnowledgeRule[] {
  if (cachedRules) return cachedRules;

  const baseDir = join(process.cwd(), "knowledge-foundation", "domains", "isa");
  const packs: IsaKnowledgeRule[] = [];

  let dirs: string[] = [];
  try {
    dirs = readdirSync(baseDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
      .map((entry) => entry.name);
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
        if (!EXECUTABLE_ISA_TOPICS.has(rule.topic)) continue;
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

export function getIsa320KnowledgeRules(): IsaKnowledgeRule[] {
  return loadIsaKnowledgeRules().filter((rule) =>
    rule.standardCode.toUpperCase().includes("ISA 320"),
  );
}

export function clearIsaRulesCache(): void {
  cachedRules = null;
}
