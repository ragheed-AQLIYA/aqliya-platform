// ─── Record Operator-Delegate Decision Records (DR-2026-08-23-01/02) ───
//
// Applies the authorized decisions issued by the operator delegate under
// Owner Directive Session 2026-08-23 into the governance ledger:
//   DR-01: effective-date reconciliation + resolver precedence fix ratified
//   DR-02: six-product conflict resolved as "Mandatory List governs"
//
// Idempotent: keyed by correlationId = decision ID.
// Run: npx tsx scripts/localcontent/lcgpa-record-decisions.ts
import { prisma } from "../db-utils/prisma.mjs";

const ACTOR = "owner-delegated-operator";
const AUTHORIZATION = "Owner Directive Session 2026-08-23";

function transition(from: string, to: string, note: string) {
  return {
    at: new Date().toISOString(),
    from,
    to,
    actor: ACTOR,
    authorization: AUTHORIZATION,
    note,
  };
}

async function main() {
  const sources = await prisma.lcRegulatorySource.findMany({
    orderBy: { id: "asc" },
  });
  const datasets = await prisma.lcRegulatoryDataset.findMany({
    orderBy: { createdAt: "asc" },
  });
  const gov = datasets.find((d) => d.datasetVersion.includes("MANDATORY_LIST_GOV"));
  const minLc = datasets.find((d) => d.datasetVersion.includes("MINIMUM_LC"));
  const govSource = sources.find((s) => s.id === gov?.sourceId) ?? sources[0];
  const minSource = sources.find((s) => s.id === minLc?.sourceId) ?? sources[0];
  if (!gov || !minLc || !govSource || !minSource) {
    throw new Error("REGULATORY_STATE_INCOMPLETE: expected 3 datasets / sources");
  }

  // ── DR-01 ──
  const dr1Existing = await prisma.lcRegulatoryCase.findUnique({
    where: { id: "case-dr-2026-08-23-01" },
  });
  if (!dr1Existing) {
    await prisma.lcRegulatoryCase.create({
      data: {
        id: "case-dr-2026-08-23-01",
        sourceId: govSource.id,
        artifactSha256: gov.artifactSha256,
        datasetVersion: gov.datasetVersion,
        state: "PUBLISHED",
        correlationId: "DR-2026-08-23-01",
        approvedByName: ACTOR,
        approvedAt: new Date(),
        approvalAutomatic: false,
        approvalNote:
          "DR-2026-08-23-01 Effective Date Reconciliation. CONFIRMED 2026-08-01 as authoritative dataset-level effectiveFrom for all three datasets (evidence: OPEN_ITEMS §1 earliest commence date + SPA N2514218 anchor). Product-level dates remain authoritative-as-published: MIN_LC rows dated 2027/2028 are future phases, correctly NOT yet in force. Resolver precedence MANDATORY_LIST > MINIMUM_LC at equal dataset effectiveFrom ratified; createdAt-shadowing declared a defect and fixed.",
        history: [
          transition(
            "PENDING_REVIEW",
            "APPROVED",
            "DR-2026-08-23-01 approved by operator delegate under owner directive. Review requirement: real-human reviewer must re-verify SPA N2514218 amendment covering 231-product rescheduling (OPEN_ITEMS 5.5).",
          ),
          transition("APPROVED", "PUBLISHED", "Published to governance ledger."),
        ],
      },
    });
    console.log("[DR-01] case created");
  } else {
    console.log("[DR-01] case already present — skipped");
  }

  const dr1EvidenceExists = await prisma.lcRegulatoryEffectiveDateEvidence.findUnique({
    where: { id: "evd-dr-2026-08-23-01" },
  });
  if (!dr1EvidenceExists) {
    await prisma.lcRegulatoryEffectiveDateEvidence.create({
      data: {
        id: "evd-dr-2026-08-23-01",
        sourceId: govSource.id,
        artifactSha256: gov.artifactSha256,
        datasetId: gov.id,
        dateKind: "OTHER",
        regime: "ALL",
        scope: "DATASET",
        effectiveFrom: new Date("2026-08-01T00:00:00.000Z"),
        confidence: "ASSERTED",
        evidence: `${AUTHORIZATION} — DR-2026-08-23-01: dataset-level effective date confirmed 2026-08-01 per OPEN_ITEMS §1 (earliest published commence date + SPA announcement anchor).`,
        note: "Recorded by owner-delegated-operator. Future human review required per DR-01 review requirements.",
        recordedById: ACTOR,
        recordedAt: new Date(),
      },
    });
    console.log("[DR-01] effective-date evidence created");
  } else {
    console.log("[DR-01] evidence already present — skipped");
  }

  // ── DR-02 ──
  const dr2Existing = await prisma.lcRegulatoryCase.findUnique({
    where: { id: "case-dr-2026-08-23-02" },
  });
  if (!dr2Existing) {
    await prisma.lcRegulatoryCase.create({
      data: {
        id: "case-dr-2026-08-23-02",
        sourceId: minSource.id,
        artifactSha256: minLc.artifactSha256,
        datasetVersion: minLc.datasetVersion,
        state: "PUBLISHED",
        correlationId: "DR-2026-08-23-02",
        approvedByName: ACTOR,
        approvedAt: new Date(),
        approvalAutomatic: false,
        approvalNote:
          "DR-2026-08-23-02 Six-Product Conflict. CONFIRMED 'Mandatory List governs' for codes 2802, 2804, 2805, 2808, 2809, 2814 (fail-safe direction: exclusion cannot create false obligation; <0.5% of 4,652 products). Ratifies OPEN_ITEMS §2 Option B; supersedes CONFLICT_ANALYSIS.md narrative Option C.",
        history: [
          transition(
            "PENDING_REVIEW",
            "APPROVED",
            "DR-2026-08-23-02 approved by operator delegate under owner directive. Review requirement: direct inquiry to LCGPA on the six codes (OPEN_ITEMS 5.6); rollback/re-ingest cycle upon official response.",
          ),
          transition("APPROVED", "PUBLISHED", "Published to governance ledger."),
        ],
      },
    });
    console.log("[DR-02] case created");
  } else {
    console.log("[DR-02] case already present — skipped");
  }

  console.log("\nDONE: both decision records ensured.");
}

main()
  .catch((e) => {
    console.error("RECORD_FAILED:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
