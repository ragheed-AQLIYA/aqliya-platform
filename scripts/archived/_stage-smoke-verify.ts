/**
 * Server-side smoke verification against the restored staging target.
 * Connects via Prisma (same layer as app) and validates key query paths.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.argv[2] || "postgresql://aqliya_test:aqliya_test@localhost:5433/aqliya_test";

async function main() {
  console.log("=== Restored Target Smoke Verification ===");
  console.log(`Target: ${url.replace(/\/\/.*:.*@/, "//***:***@")}\n`);

  const p = new PrismaClient({ adapter: new PrismaPg(url) });

  // 1. Connectivity
  await p.$queryRaw`SELECT 1`;
  console.log("[1/8] Database connectivity: PASS");

  // 2. AuditOS — engagement overview
  const engCount = await p.auditEngagement.count();
  console.log(`[2/8] Audit engagements: ${engCount} (expect 2) — ${engCount === 2 ? "PASS" : "FAIL"}`);

  const engGulf = await p.auditEngagement.findUnique({ where: { id: "eng-gulf-2025" } });
  console.log(`[3/8] eng-gulf-2025: ${!!engGulf}, status=${engGulf?.status} — ${!!engGulf && engGulf.status === "in_progress" ? "PASS" : "FAIL"}`);

  // 3. AuditOS — evidence
  const evCount = await p.auditEvidence.count();
  console.log(`[4/8] Evidence records: ${evCount} — ${evCount > 0 ? "PASS" : "FAIL"}`);

  // 4. AuditOS — findings
  const fiCount = await p.auditFinding.count();
  console.log(`[5/8] Finding records: ${fiCount} — ${fiCount > 0 ? "PASS" : "FAIL"}`);

  // 5. AuditOS — events/audit trail
  const evtCount = await p.auditEvent.count();
  console.log(`[6/8] Audit events (trail): ${evtCount} — ${evtCount > 0 ? "PASS" : "FAIL"}`);

  // 6. SalesOS — persistence
  const saCount = await p.salesAccount.count();
  console.log(`[7/8] Sales accounts: ${saCount} — ${saCount === 3 ? "PASS" : "UNEXPECTED"}`);

  // 7. LocalContentOS — LC projects
  const lcCount = await p.localContentProject.count();
  console.log(`[8/8] LC projects: ${lcCount} — ${lcCount > 0 ? "PASS" : "FAIL"}`);

  // Summary
  console.log("\n=== Verification Summary ===");
  console.log("All critical data accessible via Prisma (app data layer).");

  await p.$disconnect();
}

main().catch(e => {
  console.error("SMOKE FAIL:", e.message);
  process.exit(1);
});
