/**
 * Agent — Predictive Risk
 * Forecasts hotspots from size/complexity/dependency growth signals.
 */

import { writeAgentReport } from "../lib/report.mjs";
import { finding, scoreFromFindings } from "../lib/findings.mjs";
import {
  productOfPath,
  dataPath,
  ensureDataLake,
  loadMetricsSeries,
} from "../lib/data-lake.mjs";
import {
  collectSourceFiles,
  readText,
  rel,
  lineCount,
  writeText,
  writeJson,
  engPath,
  isoNow,
  ensureDir,
} from "../lib/fs-utils.mjs";
import { estimateComplexity, extractImports } from "../lib/ast-lite.mjs";

const AGENT = "predictive-risk";

export async function run() {
  ensureDataLake();
  ensureDir(engPath("intelligence"));

  const files = collectSourceFiles(["src"]);
  const byProduct = new Map();

  for (const absFile of files) {
    const fileRel = rel(absFile);
    if (/__tests__|\.test\.|\.spec\./.test(fileRel)) continue;
    const product = productOfPath(fileRel);
    const content = readText(absFile);
    if (!content) continue;
    const loc = lineCount(content);
    const cx = estimateComplexity(content).fileScore;
    const imports = extractImports(content).length;
    const cur = byProduct.get(product) || {
      product,
      files: 0,
      loc: 0,
      complexitySum: 0,
      importSum: 0,
      hotFiles: [],
    };
    cur.files += 1;
    cur.loc += loc;
    cur.complexitySum += cx;
    cur.importSum += imports;
    if (loc >= 400 || cx >= 50) {
      cur.hotFiles.push({ file: fileRel, loc, cx });
    }
    byProduct.set(product, cur);
  }

  const series = loadMetricsSeries();
  const debtTrend =
    series.length >= 2
      ? (series[series.length - 1].technicalDebtScore ?? series[series.length - 1].debt) -
        (series[series.length - 2].technicalDebtScore ?? series[series.length - 2].debt)
      : 0;

  const predictions = [];
  const findings = [];

  for (const p of byProduct.values()) {
    const avgCx = p.files ? p.complexitySum / p.files : 0;
    const avgImports = p.files ? p.importSum / p.files : 0;
    let riskScore = 0;
    const reasons = [];

    if (p.loc >= 3000) {
      riskScore += 25;
      reasons.push(`LOC ${p.loc} ≥ 3000`);
    } else if (p.loc >= 1500) {
      riskScore += 12;
      reasons.push(`LOC ${p.loc} growing`);
    }
    if (avgCx >= 25) {
      riskScore += 20;
      reasons.push(`avg complexity ${avgCx.toFixed(1)}`);
    }
    if (avgImports >= 15) {
      riskScore += 15;
      reasons.push(`dense imports avg ${avgImports.toFixed(1)}`);
    }
    if (p.hotFiles.length >= 5) {
      riskScore += 15;
      reasons.push(`${p.hotFiles.length} hot files`);
    }
    if (debtTrend < -5 && p.product !== "Platform") {
      riskScore += 10;
      reasons.push(`platform debt score declining (${debtTrend})`);
    }

    const level = riskScore >= 50 ? "high" : riskScore >= 30 ? "medium" : "low";
    const horizon =
      riskScore >= 50 ? "2–4 weeks" : riskScore >= 30 ? "1–2 months" : "monitor";

    predictions.push({
      product: p.product,
      loc: p.loc,
      files: p.files,
      avgComplexity: Math.round(avgCx * 10) / 10,
      avgImports: Math.round(avgImports * 10) / 10,
      hotFiles: p.hotFiles.length,
      riskScore,
      level,
      horizon,
      reasons,
      forecast:
        riskScore >= 50
          ? `High bug/regression probability — schedule refactor before next feature wave`
          : riskScore >= 30
            ? `Likely needs structural refactor within ${horizon}`
            : `Stable — continue normal delivery`,
    });

    if (riskScore >= 30) {
      findings.push(
        finding({
          agent: AGENT,
          severity: level === "high" ? "high" : "medium",
          category: "predictive-risk",
          title: `${p.product}: predictive risk ${level} (score ${riskScore})`,
          evidence: reasons.join("; "),
          suggestion: predictions[predictions.length - 1].forecast,
        })
      );
    }
  }

  predictions.sort((a, b) => b.riskScore - a.riskScore);

  const md = [
    "# Predictive Risk",
    "",
    `**Generated:** ${isoNow()}`,
    "",
    "| Product | LOC | Files | Avg Cx | Risk | Horizon | Forecast |",
    "| ------- | --- | ----- | ------ | ---- | ------- | -------- |",
    ...predictions.map(
      (p) =>
        `| ${p.product} | ${p.loc} | ${p.files} | ${p.avgComplexity} | **${p.level}** (${p.riskScore}) | ${p.horizon} | ${p.forecast} |`
    ),
    "",
    "## Top Hotspots",
    "",
    ...predictions
      .filter((p) => p.level !== "low")
      .slice(0, 8)
      .flatMap((p) => [
        `### ${p.product}`,
        "",
        `- Reasons: ${p.reasons.join("; ") || "—"}`,
        `- Horizon: ${p.horizon}`,
        "",
      ]),
    "",
    "> Predictions are probabilistic heuristics for planning — not guarantees.",
    "",
  ].join("\n");

  writeText(engPath("intelligence", "PREDICTIONS.md"), md);
  writeJson(dataPath("predictions", "latest.json"), { at: isoNow(), predictions });

  // Persist product size snapshot for future trend learning
  writeJson(dataPath("products", `size-${isoNow().replace(/[:.]/g, "-")}.json`), {
    at: isoNow(),
    products: predictions,
  });
  writeJson(dataPath("products", "size-latest.json"), { at: isoNow(), products: predictions });

  return writeAgentReport({
    name: "predictive-risk",
    title: "Predictive Risk Report",
    score: scoreFromFindings(findings, { maxDeduction: 45 }),
    findings,
    sections: [{ heading: "Forecasts", body: md }],
    meta: { predictions },
  });
}
