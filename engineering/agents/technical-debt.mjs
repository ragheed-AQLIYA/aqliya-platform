/**
 * Agent 8 — Technical Debt
 * Debt score, refactor opportunities, risk hotspots, legacy areas, priority.
 */

import path from "node:path";
import {
  collectSourceFiles,
  readText,
  rel,
  lineCount,
} from "../lib/fs-utils.mjs";
import { buildExclusionFn } from "../config.mjs";
import { finding, scoreFromFindings } from "../lib/findings.mjs";

const isExcluded = buildExclusionFn("technicalDebt");
import { writeAgentReport } from "../lib/report.mjs";
import {
  estimateComplexity,
  maintainabilityIndex,
  countTodoFixme,
} from "../lib/ast-lite.mjs";

const AGENT = "technical-debt";

function priorityScore({ severityWeight, loc, complexity, todos, tsIgnore }) {
  return Math.round(severityWeight * 10 + loc / 50 + complexity / 2 + todos * 3 + tsIgnore * 8);
}

export async function run() {
  const findings = [];
  const hotspots = [];
  const files = collectSourceFiles(["src"]);

  let totalTodos = 0;
  let tsIgnore = 0;
  let anyCasts = 0;
  let legacyPaths = 0;

  for (const absFile of files) {
    const fileRel = rel(absFile);
    const content = readText(absFile);
    if (!content) continue;
    const loc = lineCount(content);
    const cx = estimateComplexity(content).fileScore;
    const mi = maintainabilityIndex(content, loc);
    const todos = countTodoFixme(content);
    totalTodos += todos;
    const ignores = (content.match(/@ts-ignore|@ts-nocheck|eslint-disable/g) || []).length;
    tsIgnore += ignores;
    const anys = (content.match(/\bas any\b|: any\b/g) || []).length;
    anyCasts += anys;

    // Legacy detection: path-based only (not content-based).
    // A single @deprecated tag in an active file should not flag the entire file.
    const isLegacy = /\/archived\/|legacy|deprecated|sunbul\/|old-/i.test(fileRel);

    if (isLegacy && !isExcluded(fileRel)) {
      legacyPaths += 1;
      findings.push(
        finding({
          agent: AGENT,
          severity: "low",
          category: "legacy",
          title: `Legacy/deprecated signal: ${path.basename(fileRel)}`,
          evidence: "Path or comment indicates legacy",
          files: [fileRel],
        })
      );
    }

    const debtPoints = priorityScore({
      severityWeight: mi < 40 ? 5 : mi < 55 ? 3 : 1,
      loc,
      complexity: cx,
      todos,
      tsIgnore: ignores,
    });

    if ((debtPoints >= 40 || mi < 45 || todos >= 5 || ignores >= 3 || loc >= 600) && !isExcluded(fileRel)) {
      hotspots.push({
        file: fileRel,
        loc,
        mi,
        complexity: cx,
        todos,
        ignores,
        anys,
        priority: debtPoints,
      });
    }
  }

  hotspots.sort((a, b) => b.priority - a.priority);

  for (const h of hotspots.slice(0, 40)) {
    findings.push(
      finding({
        agent: AGENT,
        severity: h.priority >= 80 ? "high" : h.priority >= 50 ? "medium" : "low",
        category: "risk-hotspot",
        title: `Debt hotspot (priority ${h.priority}): ${path.basename(h.file)}`,
        evidence: `LOC=${h.loc}, MI=${h.mi}, complexity=${h.complexity}, TODO=${h.todos}, suppressions=${h.ignores}, any=${h.anys}`,
        files: [h.file],
        suggestion: "Candidate for OpenCode-owned refactor — see engineering/refactors/.",
        scoreImpact: h.priority >= 80 ? 5 : 2,
      })
    );
  }

  findings.push(
    finding({
      agent: AGENT,
      severity: "info",
      category: "debt-summary",
      title: "Repository debt inventory",
      evidence: `TODO/FIXME=${totalTodos}, suppressions=${tsIgnore}, any-casts=${anyCasts}, legacy signals=${legacyPaths}, hotspots=${hotspots.length}`,
    })
  );

  // Debt index 0–100 (higher = more debt) then invert for health score
  const debtIndex = Math.min(
    100,
    Math.round(
      hotspots.slice(0, 20).reduce((s, h) => s + h.priority, 0) / 20 +
        Math.min(40, totalTodos) +
        Math.min(20, tsIgnore)
    )
  );
  const healthFromDebt = Math.max(0, 100 - Math.round(debtIndex / 2));
  const score = Math.round((scoreFromFindings(findings) + healthFromDebt) / 2);

  const topTable = [
    "| Priority | File | MI | LOC | TODOs |",
    "| -------- | ---- | -- | --- | ----- |",
    ...hotspots
      .slice(0, 20)
      .map((h) => `| ${h.priority} | \`${h.file}\` | ${h.mi} | ${h.loc} | ${h.todos} |`),
  ].join("\n");

  return writeAgentReport({
    name: "technical-debt",
    title: "Technical Debt Report",
    score,
    findings,
    sections: [
      {
        heading: "Debt Index",
        body: `Approximate debt index: **${debtIndex}/100** (higher = more debt).\n\nHealth contribution: ${healthFromDebt}/100.`,
      },
      { heading: "Top Refactor Opportunities", body: topTable },
      {
        heading: "Boundary",
        body: "Suggestions only. OpenCode decides whether and how to refactor. No automatic code changes.",
      },
    ],
    meta: {
      debtIndex,
      totalTodos,
      tsIgnore,
      anyCasts,
      legacyPaths,
      hotspots: hotspots.slice(0, 50),
    },
  });
}
