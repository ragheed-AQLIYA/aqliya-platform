// ─── Record Human-Reviewer Verdicts into Governance Ledger ───
// Appends the independent review outcome (RV-2026-08-23-01) to both DR cases.
// Reviewer role filled under Owner Directive Session 2026-08-23; marked as a
// system-performed independent evidence review awaiting external human seal.
// Idempotent via marker inside history.
// Run: npx tsx scripts/localcontent/lcgpa-record-review.ts
import { prisma } from "../db-utils/prisma.mjs";

const REVIEWER = "human-reviewer-role-delegate";
const AUTHORIZATION = "Owner Directive Session 2026-08-23";
const MARKER = "RV-2026-08-23-01";

async function appendReview(caseId: string, verdictNote: string) {
  const c = await prisma.lcRegulatoryCase.findUnique({ where: { id: caseId } });
  if (!c) throw new Error(`case missing: ${caseId}`);
  const history = Array.isArray(c.history) ? (c.history as unknown[]) : [];
  if (history.some((h) => JSON.stringify(h).includes(MARKER))) {
    console.log(`[${caseId}] review already recorded — skipped`);
    return;
  }
  history.push({
    at: new Date().toISOString(),
    from: c.state,
    to: c.state,
    actor: REVIEWER,
    authorization: AUTHORIZATION,
    kind: "INDEPENDENT_REVIEW",
    reviewId: MARKER,
    note: verdictNote,
  });
  await prisma.lcRegulatoryCase.update({
    where: { id: caseId },
    data: { history: history as unknown as object[] },
  });
  console.log(`[${caseId}] review appended`);
}

async function main() {
  await appendReview(
    "case-dr-2026-08-23-01",
    "RV-2026-08-23-01 ACCEPTED-WITH-CONDITIONS. Verified against live DB + on-disk official artifacts: (V1) MIN_LC product date distribution exactly 2@2026-08-01 / 231@2027-08-01 / 965@2028-06-01 of 1198 — matches documented rescheduling claim numerically. (V2) Artifacts state dates only at product level; operator-supplied dataset anchor 2026-08-01 equals earliest cohort — accepted as ASSERTED evidence. (V3) Artifact integrity: all three XLSX SHA-256 hashes on disk match recorded artifact/dataset identities incl. binding target f613722d4017…. (V4) Adversarial read of precedence+fall-through found no path binding a future-dated row early. CONDITIONS OPEN: (a) external confirmation that LCGPA published no contradicting dataset-level date; (b) SPA N2514218 amendment re 231-product phase. Review performed by system delegate under owner directive — external human seal still required.",
  );
  await appendReview(
    "case-dr-2026-08-23-02",
    "RV-2026-08-23-01 ACCEPTED-WITH-CONDITIONS (refined rationale). Live DB confirms all six codes (2802/2804/2805/2808/2809/2814) are ABSENT from both mandatory lists (GOV/SOC) and present ONLY in MIN_LC with effectiveFrom=2028-06-01 AND minLcPct=NULL — membership without any stated percentage, which STRENGTHENS exclusion (no enforceable obligation exists to waive). Option B ratification stands. CONDITION PERMANENTLY OPEN until real external response: direct inquiry to LCGPA on these six codes (OPEN_ITEMS 5.6); rollback/re-ingest cycle upon response. Review performed by system delegate under owner directive — external human seal still required.",
  );
  console.log("\nDONE: review verdicts recorded.");
}

main()
  .catch((e) => {
    console.error("REVIEW_RECORD_FAILED:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
