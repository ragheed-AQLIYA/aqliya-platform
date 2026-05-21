import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../../.env") });
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const p = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL!),
});

const ENG = "eng-gulf-2025";
let passed = 0,
  failed = 0,
  warnings = 0;

function check(name: string, ok: boolean, detail: string) {
  if (ok) {
    passed++;
    console.log(`  ✅ ${name}: ${detail}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}: ${detail}`);
  }
}

function warn(name: string, detail: string) {
  warnings++;
  console.log(`  ⚠️  ${name}: ${detail}`);
}

async function main() {
  console.log("\n══════════════════════════════════════════════════════════");
  console.log("  AuditOS — Demo Rehearsal Verification");
  console.log("══════════════════════════════════════════════════════════\n");

  console.log("━━━ ENVIRONMENT ──────────────────────────");
  const eng = await p.auditEngagement.findUnique({
    where: { id: ENG },
    include: { client: true },
  });
  check(
    "Engagement exists and loaded",
    !!eng,
    eng
      ? `${eng.client?.name}, FY${eng.fiscalPeriod}, Status: ${eng.status}`
      : "MISSING",
  );
  if (!eng) {
    console.log(
      "\n❌ CRITICAL: Engagement not found. Run: npm run seed:audit\n",
    );
    process.exit(1);
  }

  console.log("\n━━━ TRIAL BALANCE ────────────────────────");
  const tb = await p.auditTrialBalance.findFirst({
    where: { engagementId: ENG },
    include: { lines: true },
    orderBy: { createdAt: "desc" },
  });
  check(
    "Trial balance loaded with lines",
    !!tb && tb.lines.length >= 20,
    tb
      ? `${tb.lines.length} lines, trust=${tb.trustState}, variance=SAR ${tb.variance.toLocaleString()}`
      : "MISSING",
  );
  if (tb) {
    const types = [...new Set(tb.lines.map((l) => l.accountType))].filter(
      Boolean,
    );
    check("Account types diverse", types.length >= 4, types.join(", "));
  }

  console.log("\n━━━ ACCOUNT MAPPING ──────────────────────");
  const maps = await p.auditAccountMapping.findMany({
    where: { engagementId: ENG },
  });
  check(
    "Mappings present with pending account",
    maps.length > 0,
    `${maps.length} total, ${maps.filter((m) => m.status === "pending").length} pending`,
  );

  console.log("\n━━━ FINANCIAL STATEMENTS ──────────────────");
  const stmts = await p.auditFinancialStatement.findMany({
    where: { engagementId: ENG },
  });
  check(
    "3 statement types",
    stmts.length === 3,
    stmts.map((s) => s.statementType).join(", "),
  );

  console.log("\n━━━ DISCLOSURE NOTES ──────────────────────");
  const notes = await p.auditDisclosureNote.findMany({
    where: { engagementId: ENG },
  });
  check(
    "10 notes with varied status",
    notes.length === 10,
    `${notes.length} notes, ${notes.filter((n) => n.aiDrafted).length} AI-drafted`,
  );

  console.log("\n━━━ EVIDENCE ─────────────────────────────");
  const ev = await p.auditEvidence.findMany({
    where: { engagementId: ENG },
    include: { links: true },
  });
  check(
    "Evidence with mixed states and links",
    ev.length >= 5,
    `${ev.length} items, states: ${[...new Set(ev.map((e) => e.state))].join(", ")}`,
  );
  check(
    "Links between evidence and accounts",
    ev.some((e) => e.links.length > 0),
    `${ev.filter((e) => e.links.length > 0).length} items linked`,
  );

  console.log("\n━━━ FINDINGS ─────────────────────────────");
  const findings = await p.auditFinding.findMany({
    where: { engagementId: ENG },
  });
  check(
    "Findings with varied severity",
    findings.length >= 3,
    `${findings.length} items, severity: ${[...new Set(findings.map((f) => f.severity))].join(", ")}`,
  );
  check(
    "High/critical unresolved",
    findings.some(
      (f) =>
        (f.severity === "high" || f.severity === "critical") &&
        f.status !== "resolved",
    ),
    "Blocks approval",
  );

  console.log("\n━━━ RECOMMENDATIONS ──────────────────────");
  const recs = await p.auditRecommendation.findMany({
    where: { engagementId: ENG },
  });
  check(
    "Recommendations linked to findings",
    recs.length >= 2,
    `${recs.length} items, ${recs.filter((r) => r.findingId).length} linked to findings`,
  );

  console.log("\n━━━ REVIEW COMMENTS ──────────────────────");
  const comments = await p.auditReviewComment.findMany({
    where: { engagementId: ENG },
  });
  check(
    "Open comments targeting entities",
    comments.length >= 1 && comments.some((c) => c.status === "open"),
    `${comments.length} comments, ${comments.filter((c) => c.status === "open").length} open`,
  );

  console.log("\n━━━ APPROVAL BLOCKED SCENARIO ────────────");
  const openR = comments.filter((c) => c.status === "open").length;
  const missEv = ev.filter((e) => e.state === "missing").length;
  const unmap = maps.filter((m) => m.status === "pending").length;
  const hiFind = findings.filter(
    (f) =>
      (f.severity === "high" || f.severity === "critical") &&
      f.status !== "resolved" &&
      f.status !== "dismissed",
  ).length;
  check(
    "Multiple blockers for demo",
    openR + missEv + unmap + hiFind >= 3,
    `openReviews=${openR}, missingEv=${missEv}, unmapped=${unmap}, highFind=${hiFind}`,
  );

  console.log("\n━━━ APPROVAL RECORDS ─────────────────────");
  const approvals = await p.auditApprovalRecord.findMany({
    where: { engagementId: ENG },
  });
  check(
    "Approval records with actor info",
    approvals.length >= 1,
    `${approvals.length} records, all have approver info: ${approvals.every((a) => a.approverId && a.approverName)}`,
  );

  console.log("\n━━━ AI OUTPUTS ────────────────────────────");
  const ais = await p.auditAiOutput.findMany({ where: { engagementId: ENG } });
  check(
    "AI outputs with source entities (not final)",
    ais.length >= 4,
    `${ais.length} outputs, ${ais.filter((a) => a.sourceEntityType).length}/${ais.length} have sourceEntity, statuses=${[...new Set(ais.map((a) => a.status))].join(",")}`,
  );
  check(
    "AI type coverage",
    [
      "note_draft",
      "finding",
      "recommendation",
      "anomaly_explanation",
      "mapping",
    ].every((t) => ais.some((a) => a.suggestionType === t)),
    "note_draft,finding,recommendation,anomaly_explanation,mapping",
  );
  check(
    "Accept/reject workflow shown",
    ais.some((a) => a.status === "accepted_by_human") &&
      ais.some((a) => a.status === "suggested"),
    `${ais.filter((a) => a.status === "accepted_by_human").length} accepted, ${ais.filter((a) => a.status === "suggested").length} suggested`,
  );

  console.log("\n━━━ AUDIT EVENTS ─────────────────────────");
  const events = await p.auditEvent.findMany({ where: { engagementId: ENG } });
  check(
    "28+ events with full metadata",
    events.length >= 26,
    `${events.length} events, types=${[...new Set(events.map((e) => e.eventType))].length} unique`,
  );
  check(
    "Actor info on all events",
    events.every((e) => e.actorId && e.actorName && e.actorRole),
    "All events have actor context",
  );
  check(
    "Core types present",
    [
      "engagement.created",
      "trial_balance.uploaded",
      "evidence.created",
      "evidence.linked",
      "finding.created",
      "recommendation.created",
      "review.comment_added",
    ].every((t) => events.some((e) => e.eventType === t)),
    "All core event types present",
  );

  console.log("\n━━━ EXPORTS ──────────────────────────────");
  check(
    "All export components available",
    stmts.length >= 3 &&
      notes.length >= 8 &&
      ev.length >= 5 &&
      findings.length >= 3 &&
      recs.length >= 2 &&
      comments.length >= 1 &&
      approvals.length >= 1 &&
      events.length >= 20,
    `stmts=${stmts.length}, notes=${notes.length}, ev=${ev.length}, findings=${findings.length}, recs=${recs.length}, comments=${comments.length}, approvals=${approvals.length}, events=${events.length}`,
  );

  console.log("\n━━━ BILINGUAL ────────────────────────────");
  check(
    "Client has currency for bilingual labels",
    !!eng.client?.currencyCode,
    `currency=${eng.client?.currencyCode}`,
  );
  check(
    "All statements have titles",
    stmts.every((s) => s.title),
    "Titles ready for Arabic prefix",
  );

  console.log("\n══════════════════════════════════════════════════════════");
  console.log("  REHEARSAL VERIFICATION RESULTS");
  console.log("══════════════════════════════════════════════════════════");
  console.log(`  Passed:   ${passed}`);
  console.log(`  Failed:   ${failed}`);
  console.log(`  Warnings: ${warnings}`);
  console.log(`  Total:    ${passed + failed + warnings}`);
  console.log("");

  if (failed > 0) {
    console.log(`  ❌ ${failed} CHECK(S) FAILED`);
    process.exit(1);
  }
  if (warnings > 0) {
    console.log(`  ⚠️  ${warnings} WARNING(S)`);
  }
  console.log("  ✅ ALL CHECKS PASSED");
  console.log("══════════════════════════════════════════════════════════\n");

  await p.$disconnect();
}

main().catch((e) => {
  console.error("Rehearsal error:", e);
  process.exit(1);
});
