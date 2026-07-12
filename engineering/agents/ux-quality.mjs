/**
 * Agent 6 — UX Quality
 * Consistency, a11y, design system, spacing, typography, responsive, dark mode.
 * Findings only — does not redesign UI.
 */

import {
  collectSourceFiles,
  readText,
  rel,
  exists,
  abs,
} from "../lib/fs-utils.mjs";
import { finding, scoreFromFindings } from "../lib/findings.mjs";
import { writeAgentReport } from "../lib/report.mjs";

const AGENT = "ux-quality";

export async function run() {
  const findings = [];
  const files = collectSourceFiles(["src"]).filter((f) => {
    const r = rel(f);
    return r.endsWith(".tsx") || r.endsWith(".css");
  });

  let missingAlt = 0;
  let missingAria = 0;
  let inlineStyles = 0;
  let fixedPxSpam = 0;
  let noRtl = 0;
  let darkModeHits = 0;
  let englishOnlyHardcode = 0;

  const hasDirRtl = exists(abs("src")) &&
    collectSourceFiles(["src"]).some((f) => /dir=['"]rtl['"]|rtl:/.test(readText(f) || ""));

  for (const absFile of files) {
    const fileRel = rel(absFile);
    const content = readText(absFile);
    if (!content) continue;

    // img without alt
    const imgs = content.match(/<img\b[^>]*>/g) || [];
    for (const tag of imgs) {
      if (!/\balt=/.test(tag)) {
        missingAlt += 1;
        if (missingAlt <= 25) {
          findings.push(
            finding({
              agent: AGENT,
              severity: "medium",
              category: "accessibility",
              title: "Image missing alt attribute",
              evidence: tag.slice(0, 120),
              files: [fileRel],
            })
          );
        }
      }
    }

    // icon buttons without aria-label
    if (/<button[^>]*>\s*<(\w+)\s*\/>\s*<\/button>/.test(content) || /Button[^>]*>\s*<(Search|X|Menu|Trash)/.test(content)) {
      if (!/aria-label|sr-only|visually-hidden/.test(content)) {
        missingAria += 1;
        if (missingAria <= 20) {
          findings.push(
            finding({
              agent: AGENT,
              severity: "low",
              category: "accessibility",
              title: "Possible icon-only control without accessible name",
              evidence: "button/icon pattern without aria-label/sr-only in file",
              files: [fileRel],
            })
          );
        }
      }
    }

    // Inline styles vs design system
    if ((content.match(/style=\{\{/g) || []).length >= 5) {
      inlineStyles += 1;
      findings.push(
        finding({
          agent: AGENT,
          severity: "low",
          category: "design-system",
          title: "Heavy inline style usage",
          evidence: "≥5 style={{...}} occurrences",
          files: [fileRel],
          suggestion: "Prefer Tailwind tokens / shared UI primitives (shadcn).",
        })
      );
    }

    // Spacing/typography — arbitrary large px values
    const px = content.match(/\btext-\[[0-9]+px\]|p-\[[0-9]{3,}px\]|gap-\[[0-9]{3,}px\]/g) || [];
    if (px.length >= 3) {
      fixedPxSpam += 1;
      findings.push(
        finding({
          agent: AGENT,
          severity: "info",
          category: "spacing-typography",
          title: "Many arbitrary px Tailwind values",
          evidence: px.slice(0, 5).join(", "),
          files: [fileRel],
        })
      );
    }

    // Responsive — lack of sm/md/lg in large pages
    if (fileRel.includes("/app/") && content.length > 3000) {
      if (!/\b(sm|md|lg|xl):/.test(content)) {
        findings.push(
          finding({
            agent: AGENT,
            severity: "low",
            category: "responsive",
            title: "Large page without responsive breakpoint classes",
            evidence: "No sm:/md:/lg: utilities detected",
            files: [fileRel],
          })
        );
      }
    }

    // Dark mode
    if (/dark:/.test(content)) darkModeHits += 1;

    // Arabic-first — English-only CTA walls in marketing (heuristic)
    if (/src\/app\/\(marketing\)/.test(fileRel) || /src\/app\/page\.tsx/.test(fileRel)) {
      if (/\b(Get Started|Learn More|Sign Up|Book a Demo)\b/.test(content) && !/[\u0600-\u06FF]/.test(content)) {
        englishOnlyHardcode += 1;
        findings.push(
          finding({
            agent: AGENT,
            severity: "medium",
            category: "consistency",
            title: "Marketing surface may lack Arabic copy",
            evidence: "English CTA phrases without Arabic characters in file",
            files: [fileRel],
            suggestion: "AQLIYA is Arabic-first; ensure bilingual primary flows.",
          })
        );
      }
    }
  }

  if (!hasDirRtl) {
    noRtl = 1;
    findings.push(
      finding({
        agent: AGENT,
        severity: "high",
        category: "consistency",
        title: "No RTL dir/class signals detected in src",
        evidence: "Search for dir='rtl' / rtl: returned empty",
        suggestion: "Verify root layout sets dir and RTL-aware components.",
      })
    );
  }

  if (darkModeHits === 0) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "info",
        category: "dark-mode",
        title: "No dark: Tailwind variants detected",
        evidence: "Repository may intentionally be light-only — confirm design system",
      })
    );
  }

  // Design system components folder
  if (!exists(abs("src/components/ui"))) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "medium",
        category: "design-system",
        title: "src/components/ui not found",
        evidence: "Expected shadcn/ui primitives directory",
      })
    );
  }

  const score = scoreFromFindings(findings);

  return writeAgentReport({
    name: "ui-quality",
    title: "UX Quality Report",
    score,
    findings,
    sections: [
      {
        heading: "Scope",
        body: [
          `- TSX/CSS files: ${files.length}`,
          `- Missing alt (sampled findings capped): ${missingAlt}`,
          `- Icon a11y suspects: ${missingAria}`,
          `- Inline-style heavy files: ${inlineStyles}`,
          `- Dark mode variant hits: ${darkModeHits}`,
          `- English-only marketing suspects: ${englishOnlyHardcode}`,
          `- RTL signals present: ${hasDirRtl ? "yes" : "no"}`,
        ].join("\n"),
      },
      {
        heading: "Boundary",
        body: "This agent reviews consistency and accessibility signals. It does **not** redesign products or visual identity.",
      },
    ],
    meta: { files: files.length, missingAlt, darkModeHits, hasDirRtl },
  });
}
