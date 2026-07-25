import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

function colorFor(status) {
  switch (status) {
    case "PASS": return GREEN;
    case "FAIL": return RED;
    case "WARN": return YELLOW;
    default: return "";
  }
}

function padRight(s, n) {
  return String(s).padEnd(n);
}

export async function run() {
  const budgetsScript = join(__dirname, "..", "..", "engineering", "ci", "architectural-budgets.mjs");

  let results;
  try {
    const stdout = execSync(`node "${budgetsScript}" --json`, {
      encoding: "utf8",
      timeout: 30000,
    });
    results = JSON.parse(stdout);
  } catch (err) {
    console.error(`${RED}${BOLD}Failed to run architectural budgets:${RESET}`);
    console.error(err.stderr?.toString() || err.message);
    process.exitCode = 1;
    return;
  }

  const passes = results.filter((r) => r.status === "PASS");
  const warns = results.filter((r) => r.status === "WARN");
  const fails = results.filter((r) => r.status === "FAIL");
  const skips = results.filter((r) => r.status === "SKIP");
  const total = results.length;
  const score = total > 0 ? ((passes.length / total) * 100).toFixed(1) : "0.0";

  const godObject = results.find((r) => r.id === "god_objects");
  const godCount = godObject ? godObject.current : "?";

  console.log(`\n${BOLD}═══════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}  AQLIYA Platform Health Check${RESET}`);
  console.log(`${BOLD}───────────────────────────────────────────${RESET}`);
  console.log(`  ${CYAN}Platform Health Score:${RESET} ${BOLD}${score}%${RESET}`);
  console.log(`  ${CYAN}God Objects:${RESET}          ${godCount}`);
  console.log(`  ${CYAN}Budgets PASS:${RESET}         ${GREEN}${passes.length}${RESET}`);
  console.log(`  ${CYAN}Budgets WARN:${RESET}         ${YELLOW}${warns.length}${RESET}`);
  console.log(`  ${CYAN}Budgets FAIL:${RESET}         ${RED}${fails.length}${RESET}`);
  console.log(`  ${CYAN}Budgets SKIP:${RESET}         ${skips.length}`);
  console.log(`${BOLD}═══════════════════════════════════════════${RESET}\n`);

  console.log(`${BOLD}  Budget Details:${RESET}\n`);

  const labelW = Math.max(...results.map((r) => r.label.length), 20);
  const curW = 8;
  const maxW = 8;
  const statW = 8;

  console.log(`  ${padRight("Budget", labelW)}  ${padRight("Current", curW)}  ${padRight("Max", maxW)}  ${padRight("Status", statW)}  Reason`);
  console.log(`  ${"-".repeat(labelW)}  ${"-".repeat(curW)}  ${"-".repeat(maxW)}  ${"-".repeat(statW)}  ${"-".repeat(40)}`);

  for (const r of results) {
    const color = colorFor(r.status);
    const current = r.current != null ? String(r.current) : "—";
    const max = r.max != null ? String(r.max) : "—";
    console.log(
      `  ${padRight(r.label, labelW)}  ${padRight(current, curW)}  ${padRight(max, maxW)}  ${color}${padRight(r.status, statW)}${RESET}  ${r.reason}`,
    );
  }

  console.log(`\n  Summary: ${GREEN}${passes.length} PASS${RESET} · ${YELLOW}${warns.length} WARN${RESET} · ${RED}${fails.length} FAIL${RESET} · ${skips.length} SKIP\n`);

  if (fails.length > 0) {
    process.exitCode = 1;
  }
}
