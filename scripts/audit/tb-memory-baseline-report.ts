#!/usr/bin/env tsx
/**
 * TB Memory KPI baseline — combines governance validation + reuse rate.
 *
 * Usage:
 *   npm run tb:memory-baseline
 */
import { config } from "dotenv";
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

config({ path: resolve(__dirname, "../../.env") });

const ENGAGEMENT_ID = process.env.ENGAGEMENT_ID ?? "eng-shalfa-2025";
const evidenceDir = resolve(__dirname, "../../docs/audits/evidence");

async function main() {
  execSync("npm run phase-3d:validate-governance", {
    stdio: "inherit",
    cwd: resolve(__dirname, "../.."),
  });
  execSync("npm run tb:memory-reuse-rate", {
    stdio: "inherit",
    cwd: resolve(__dirname, "../.."),
  });

  const govPath = resolve(evidenceDir, "phase-3d-governance-validation.json");
  const reusePath = resolve(evidenceDir, "tb-memory-reuse-rate.json");

  const gov = existsSync(govPath)
    ? JSON.parse(readFileSync(govPath, "utf8"))
    : null;
  const reuse = existsSync(reusePath)
    ? JSON.parse(readFileSync(reusePath, "utf8"))
    : null;

  const evaluated = gov?.evaluatedStatusCounts ?? {};
  const total = gov?.patternCount ?? 0;
  const autoSuggest = gov?.autoSuggestEligible ?? 0;
  const autoSuggestRate = total > 0 ? autoSuggest / total : 0;
  const reuseRate = reuse?.reuseRate ?? 0;

  const reportPath = resolve(
    __dirname,
    "../../docs/audits/TB_MEMORY_KPI_BASELINE.md",
  );

  const md = `# TB Memory KPI Baseline

**Date:** ${new Date().toISOString().slice(0, 10)}  
**Engagement:** \`${ENGAGEMENT_ID}\`  
**Context:** Year 1 Shalfa backfill — TRUSTED = 0 expected.

## Metrics

| Metric | Value |
|--------|------:|
| Total Patterns | ${total} |
| Confirmed | ${evaluated.CONFIRMED ?? 0} |
| Trusted | ${evaluated.TRUSTED ?? 0} |
| Deprecated | ${evaluated.DEPRECATED ?? 0} |
| Reuse Rate | ${(reuseRate * 100).toFixed(1)}% |
| Auto Suggest Rate | ${(autoSuggestRate * 100).toFixed(1)}% |

## Interpretation

- **Trusted = 0** and **Auto Suggest = 0** are expected after first-year backfill (\`hitCount=1\`, single reviewer).
- Memory still matches at 100% on same ERP (see \`phase-3c:validate\`).
- Next milestone: Client #2 onboarding + reuse growth.

## Evidence

- \`docs/audits/evidence/phase-3d-governance-validation.json\`
- \`docs/audits/evidence/tb-memory-reuse-rate.json\`
`;

  mkdirSync(resolve(__dirname, "../../docs/audits"), { recursive: true });
  writeFileSync(reportPath, md);
  console.log(`\nBaseline report: ${reportPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
