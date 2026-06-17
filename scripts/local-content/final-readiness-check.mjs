// Final readiness check — npx tsx --env-file .env scripts/local-content/final-readiness-check.mjs
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";
const adapter = new PrismaPg(DATABASE_URL);
const prisma = new PrismaClient({ adapter });
const ORG_ID = "cmqhcenx40000fopq7rpt4o31";

async function main() {
  const finalApproved = await prisma.lcPatternSuggestion.count({ where: { organizationId: ORG_ID, status: "approved" } });
  const finalRejected = await prisma.lcPatternSuggestion.count({ where: { organizationId: ORG_ID, status: "rejected" } });
  const healthRecords = await prisma.lcPatternHealthRecord.count({ where: { organizationId: ORG_ID } });
  const matchReviewsTotal = await prisma.lcMatchReview.count({ where: { organizationId: ORG_ID } });
  const confirmedReviews = await prisma.lcMatchReview.count({ where: { organizationId: ORG_ID, status: "confirmed" } });
  const orgMemories = await prisma.lcOrganizationMatchMemory.count({ where: { organizationId: ORG_ID } });
  const aiAuditEvents = await prisma.lcAiAuditEvent.count({ where: { organizationId: ORG_ID } });
  const simulationResults = await prisma.lcSimulationResult.count({ where: { organizationId: ORG_ID } });

  const checks = {
    "Pattern Coverage": { value: finalApproved + finalRejected, target: 30, max: 39 },
    "Review Completion": { value: matchReviewsTotal > 0 ? (confirmedReviews / matchReviewsTotal) * 100 : 0, target: 80, max: 100 },
    "Health Tracking": { value: healthRecords, target: 3, max: 10 },
    "Org Memory": { value: orgMemories, target: 10, max: 20 },
    "Audit Trail": { value: aiAuditEvents, target: 5, max: 20 },
    "Simulations": { value: simulationResults, target: 5, max: 10 },
    "Pattern Acceptance": { value: finalApproved + finalRejected > 0 ? (finalApproved / (finalApproved + finalRejected)) * 100 : 0, target: 60, max: 100 },
  };

  let green = 0, red = 0;
  console.log("FINAL PILOT READINESS");
  console.log("=".repeat(50));
  for (const [k, v] of Object.entries(checks)) {
    const ok = v.value >= v.target;
    if (ok) green++; else red++;
    console.log(`${ok ? "GREEN" : "RED"}  ${k.padEnd(22)} ${String(Math.round(v.value)).padStart(4)} / target ${v.target}`);
  }
  const pct = Math.round((green / Object.keys(checks).length) * 100);
  console.log("\n" + "=".repeat(50));
  console.log(`GREEN: ${green}/${Object.keys(checks).length}`);
  console.log(`RED:   ${red}/${Object.keys(checks).length}`);
  console.log(`SCORE: ${pct}%`);
  console.log(`LEVEL: ${pct >= 80 ? "READY FOR PILOT" : pct >= 60 ? "NEEDS IMPROVEMENT" : "NOT READY"}`);

  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
