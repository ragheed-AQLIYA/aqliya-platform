/**
 * Agent 1 — Code Health
 * Detects duplication, dead/unused signals, long functions, God objects,
 * circular deps (heuristic), complexity, maintainability, SOLID smells.
 */

import path from "node:path";
import { CODE_HEALTH } from "../config.mjs";
import {
  collectSourceFiles,
  readText,
  rel,
  lineCount,
} from "../lib/fs-utils.mjs";
import { finding, scoreFromFindings } from "../lib/findings.mjs";
import { writeAgentReport, writeNamedMarkdown } from "../lib/report.mjs";
import {
  findLongFunctions,
  estimateComplexity,
  maintainabilityIndex,
  extractImports,
  extractExports,
  blockFingerprints,
} from "../lib/ast-lite.mjs";

const AGENT = "code-health";

export async function run() {
  const files = collectSourceFiles(["src"]);
  const findings = [];
  const complexityRows = [];
  const duplicationPairs = [];
  const exportIndex = new Map(); // symbol -> [files]
  const importGraph = new Map(); // file -> imported files
  const fileBlocks = [];
  const longFnCandidates = [];
  const miCandidates = [];
  const complexityCandidates = [];
  const godCandidates = [];

  for (const absFile of files) {
    const fileRel = rel(absFile);
    const content = readText(absFile);
    if (!content) continue;
    const loc = lineCount(content);

    // God objects
    const exports = extractExports(content);
    if (loc >= CODE_HEALTH.godObjectLines || exports.length >= CODE_HEALTH.godObjectExports) {
      godCandidates.push({
        fileRel,
        loc,
        exports: exports.length,
        severity: loc >= CODE_HEALTH.godObjectLines ? "high" : "medium",
      });
    }

    // Long functions
    for (const fn of findLongFunctions(content, fileRel, CODE_HEALTH.longFunctionLines)) {
      longFnCandidates.push(fn);
    }

    // Complexity + MI
    const cx = estimateComplexity(content);
    const mi = maintainabilityIndex(content, loc);
    complexityRows.push({ file: fileRel, loc, ...cx, mi });
    if (cx.fileScore >= CODE_HEALTH.complexityWarn) {
      complexityCandidates.push({ fileRel, cx, mi });
    }
    if (mi < CODE_HEALTH.maintainabilityWarn) {
      miCandidates.push({ fileRel, mi });
    }

    // Export index for unused-export heuristic
    for (const ex of exports) {
      if (!exportIndex.has(ex)) exportIndex.set(ex, []);
      exportIndex.get(ex).push(fileRel);
    }

    // Import graph (relative + alias)
    const imports = extractImports(content);
    const resolved = [];
    for (const imp of imports) {
      if (imp.startsWith(".") || imp.startsWith("@/")) {
        resolved.push(imp);
      }
    }
    importGraph.set(fileRel, resolved);

    // Duplication fingerprints (skip huge files for speed)
    if (loc <= 1500) {
      fileBlocks.push({
        file: fileRel,
        map: blockFingerprints(content, CODE_HEALTH.duplicateMinLines),
      });
    }

    // SOLID — SRP smell: mixed "use client" with prisma-ish names
    if (/['"]use client['"]/.test(content) && /prisma|createHash|fs\.|child_process/.test(content)) {
      findings.push(
        finding({
          agent: AGENT,
          severity: "high",
          category: "solid-srp",
          title: "Client module references server-only concerns",
          evidence: "use client + prisma/fs/crypto server APIs",
          files: [fileRel],
          suggestion: "Move data access to Server Actions / lib services.",
        })
      );
    }
  }

  // Emit capped God Object findings
  godCandidates
    .sort((a, b) => b.loc - a.loc)
    .slice(0, 30)
    .forEach((g) => {
      findings.push(
        finding({
          agent: AGENT,
          severity: g.severity,
          category: "god-object",
          title: `Large module / God Object signal: ${path.basename(g.fileRel)}`,
          evidence: `${g.loc} lines, ${g.exports} named exports`,
          files: [g.fileRel],
          suggestion:
            "Split by responsibility (SRP). Prefer domain modules under src/lib/<domain>/.",
        })
      );
    });

  // Emit capped long functions (worst first)
  longFnCandidates
    .sort((a, b) => b.lines - a.lines)
    .slice(0, 40)
    .forEach((fn) => {
      findings.push(
        finding({
          agent: AGENT,
          severity: fn.lines > 200 ? "high" : "medium",
          category: "long-function",
          title: `Long function ${fn.name} (${fn.lines} lines)`,
          evidence: `Lines ${fn.startLine}–${fn.endLine}`,
          files: [fn.file],
          suggestion: "Extract helpers; keep orchestration thin.",
        })
      );
    });
  if (longFnCandidates.length > 40) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "info",
        category: "long-function",
        title: `Additional long functions truncated (${longFnCandidates.length - 40} more)`,
        evidence: `Total long functions ≥${CODE_HEALTH.longFunctionLines} lines: ${longFnCandidates.length}`,
      })
    );
  }

  // Emit capped complexity
  complexityCandidates
    .sort((a, b) => b.cx.fileScore - a.cx.fileScore)
    .slice(0, 40)
    .forEach((c) => {
      findings.push(
        finding({
          agent: AGENT,
          severity: c.cx.fileScore >= CODE_HEALTH.complexityFail ? "high" : "medium",
          category: "complexity",
          title: `Elevated complexity in ${path.basename(c.fileRel)}`,
          evidence: `Decision density ≈ ${c.cx.fileScore}, MI=${c.mi}`,
          files: [c.fileRel],
          suggestion: "Reduce branching; extract strategy/table-driven logic.",
        })
      );
    });

  // Emit capped low-MI (worst first)
  miCandidates
    .sort((a, b) => a.mi - b.mi)
    .slice(0, 40)
    .forEach((m) => {
      findings.push(
        finding({
          agent: AGENT,
          severity: m.mi < CODE_HEALTH.maintainabilityFail ? "high" : "medium",
          category: "maintainability",
          title: `Low maintainability index (${m.mi})`,
          evidence: `MI=${m.mi} (warn < ${CODE_HEALTH.maintainabilityWarn})`,
          files: [m.fileRel],
        })
      );
    });
  if (miCandidates.length > 40) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "info",
        category: "maintainability",
        title: `Additional low-MI files truncated (${miCandidates.length - 40} more)`,
        evidence: `Total below warn threshold: ${miCandidates.length}`,
      })
    );
  }

  // Unused export heuristic: exported symbol never appears as import binding elsewhere
  const allContent = files.map((f) => readText(f) || "").join("\n");
  let unusedExportCount = 0;
  for (const [symbol, owners] of exportIndex) {
    if (symbol === "default" || symbol.startsWith("use")) continue;
    if (owners.length !== 1) continue;
    const importHits = (allContent.match(new RegExp(`\\b${symbol}\\b`, "g")) || []).length;
    // definition + maybe type-only; very low hits → unused candidate
    if (importHits <= 2) {
      unusedExportCount += 1;
      if (unusedExportCount <= 40) {
        findings.push(
          finding({
            agent: AGENT,
            severity: "low",
            category: "unused-export",
            title: `Possibly unused export: ${symbol}`,
            evidence: `Symbol appears ~${importHits} times in src`,
            files: owners,
            suggestion: "Confirm with IDE unused-symbol analysis before removal.",
          })
        );
      }
    }
  }
  if (unusedExportCount > 40) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "info",
        category: "unused-export",
        title: `Additional unused-export candidates truncated (${unusedExportCount - 40} more)`,
        evidence: `Total candidates: ${unusedExportCount}`,
        files: [],
      })
    );
  }

  // Unused import heuristic (imported name not used in body — light)
  let unusedImportCount = 0;
  for (const absFile of files) {
    const fileRel = rel(absFile);
    const content = readText(absFile);
    if (!content) continue;
    const namedImportRe =
      /import\s+\{([^}]+)\}\s+from\s+['"][^'"]+['"]/g;
    let m;
    while ((m = namedImportRe.exec(content))) {
      const names = m[1]
        .split(",")
        .map((s) => s.trim().split(/\s+as\s+/).pop().trim())
        .filter(Boolean);
      for (const name of names) {
        if (name === "type" || name.startsWith("type ")) continue;
        const body = content.slice(m.index + m[0].length);
        const uses = (body.match(new RegExp(`\\b${name}\\b`, "g")) || []).length;
        if (uses === 0) {
          unusedImportCount += 1;
          if (unusedImportCount <= 40) {
            findings.push(
              finding({
                agent: AGENT,
                severity: "low",
                category: "unused-import",
                title: `Possibly unused import: ${name}`,
                evidence: "Imported symbol not referenced after import statement",
                files: [fileRel],
              })
            );
          }
        }
      }
    }
  }
  if (unusedImportCount > 40) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "info",
        category: "unused-import",
        title: `Additional unused-import candidates truncated (${unusedImportCount - 40} more)`,
        evidence: `Total candidates: ${unusedImportCount}`,
        files: [],
      })
    );
  }

  // Duplication across files
  const globalBlocks = new Map();
  for (const { file, map } of fileBlocks) {
    for (const [block, lines] of map) {
      if (!globalBlocks.has(block)) globalBlocks.set(block, []);
      globalBlocks.get(block).push({ file, line: lines[0] });
    }
  }
  let dupReported = 0;
  for (const [block, locs] of globalBlocks) {
    const uniqueFiles = [...new Set(locs.map((l) => l.file))];
    if (uniqueFiles.length < 2) continue;
    // Ignore tiny/boilerplate-looking blocks
    if (block.length < 160) continue;
    duplicationPairs.push({
      files: uniqueFiles.slice(0, 5),
      preview: block.split("\n").slice(0, 3).join(" | "),
    });
    if (dupReported < 40) {
      dupReported += 1;
      findings.push(
        finding({
          agent: AGENT,
          severity: uniqueFiles.length >= 4 ? "medium" : "low",
          category: "duplication",
          title: "Duplicated code block across modules",
          evidence: `Shared across ${uniqueFiles.length} files: ${block.split("\n")[0].slice(0, 80)}…`,
          files: uniqueFiles.slice(0, 5),
          suggestion: "Extract shared helper into src/lib/ or product shared module.",
        })
      );
    }
  }
  if (duplicationPairs.length > 40) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "info",
        category: "duplication",
        title: `Additional duplication groups truncated (${duplicationPairs.length - 40} more)`,
        evidence: `Total groups: ${duplicationPairs.length}`,
      })
    );
  }

  // Circular dependency heuristic (A imports B path segment and B imports A)
  const aliasPairs = [];
  for (const [file, imps] of importGraph) {
    for (const imp of imps) {
      if (!imp.startsWith("@/")) continue;
      const targetHint = imp.replace(/^@\//, "src/");
      for (const [other, otherImps] of importGraph) {
        if (other === file) continue;
        if (!other.startsWith(targetHint) && other !== targetHint + ".ts") continue;
        const back = otherImps.some(
          (oi) => oi.startsWith("@/") && file.startsWith(oi.replace(/^@\//, "src/"))
        );
        if (back) {
          aliasPairs.push([file, other]);
        }
      }
    }
  }
  const seenCycles = new Set();
  for (const [a, b] of aliasPairs.slice(0, 20)) {
    const key = [a, b].sort().join("↔");
    if (seenCycles.has(key)) continue;
    seenCycles.add(key);
    findings.push(
      finding({
        agent: AGENT,
        severity: "medium",
        category: "circular-dependency",
        title: "Possible circular dependency",
        evidence: `${a} ↔ ${b}`,
        files: [a, b],
        suggestion: "Introduce a lower-level shared module or invert dependency.",
      })
    );
  }

  const score = scoreFromFindings(findings);
  const topComplex = [...complexityRows].sort((a, b) => b.fileScore - a.fileScore).slice(0, 25);
  const lowMi = [...complexityRows].sort((a, b) => a.mi - b.mi).slice(0, 25);

  writeNamedMarkdown(
    "duplication.md",
    [
      "# Code Duplication Report",
      "",
      `**Generated by:** Code Health Agent  `,
      `**Duplicate block groups (sampled):** ${duplicationPairs.length}`,
      "",
      "> Findings only — no automatic refactors.",
      "",
      "## Top Duplication Groups",
      "",
      ...duplicationPairs.slice(0, 40).flatMap((d, i) => [
        `### D-${i + 1}`,
        "",
        `- **Files:** ${d.files.map((f) => `\`${f}\``).join(", ")}`,
        `- **Preview:** \`${d.preview}\``,
        "",
      ]),
      duplicationPairs.length ? "" : "_No cross-file duplication groups detected at current threshold._",
      "",
    ].join("\n")
  );

  writeNamedMarkdown(
    "complexity.md",
    [
      "# Complexity & Maintainability Report",
      "",
      `**Generated by:** Code Health Agent  `,
      `**Files analyzed:** ${complexityRows.length}`,
      "",
      "## Highest Complexity Files",
      "",
      "| File | Decisions | Avg/Fn | MI | LOC |",
      "| ---- | --------- | ------ | -- | --- |",
      ...topComplex.map(
        (r) =>
          `| \`${r.file}\` | ${r.fileScore} | ${r.avgPerFunction} | ${r.mi} | ${r.loc} |`
      ),
      "",
      "## Lowest Maintainability Index",
      "",
      "| File | MI | Decisions | LOC |",
      "| ---- | -- | --------- | --- |",
      ...lowMi.map((r) => `| \`${r.file}\` | ${r.mi} | ${r.fileScore} | ${r.loc} |`),
      "",
    ].join("\n")
  );

  return writeAgentReport({
    name: AGENT,
    title: "Code Health Report",
    score,
    findings,
    sections: [
      {
        heading: "Scope",
        body: `Analyzed ${files.length} source files under \`src/\`.\n\nCompanion reports: \`duplication.md\`, \`complexity.md\`.`,
      },
      {
        heading: "Signals Covered",
        body: [
          "- Duplicate code blocks",
          "- Unused export / unused import heuristics",
          "- Long functions",
          "- God Objects (LOC / export count)",
          "- Circular dependency heuristics",
          "- Complexity & maintainability index",
          "- SOLID SRP boundary smells (client/server)",
        ].join("\n"),
      },
    ],
    meta: {
      filesAnalyzed: files.length,
      duplicationGroups: duplicationPairs.length,
      unusedExportCandidates: unusedExportCount,
    },
  });
}
