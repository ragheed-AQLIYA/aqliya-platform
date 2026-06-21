import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env") });
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const p = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) });

async function main() {
  console.log("SalesAccounts:", await p.salesAccount.count());
  console.log("SalesContacts:", await p.salesContact.count());
  console.log("SalesDeals:", await p.salesDeal.count());
  console.log("LCProjects:", await p.localContentProject.count());
  console.log("LCAuditEvents:", await p.localContentAuditEvent.count());
  console.log("PlatformAuditLogs:", await p.platformAuditLog.count());
  console.log("PlatformOrgs:", await p.platformOrganization.count());
  console.log("ClientWorkspaces:", await p.clientWorkspace.count());
  console.log("Organizations:", await p.organization.count());
  console.log("Users:", await p.user.count());
  console.log("Decisions:", await p.decision.count());
  console.log("AuditEngagements:", await p.auditEngagement.count());
  console.log("AuditEvents:", await p.auditEvent.count());
  console.log("AuditEvidence:", await p.auditEvidence.count());
  console.log("AuditFindings:", await p.auditFinding.count());
  console.log("AuditReviewComments:", await p.auditReviewComment.count());
  console.log("AuditApprovalRecords:", await p.auditApprovalRecord.count());
  console.log("AuditRecommendations:", await p.auditRecommendation.count());
  console.log("AuditAiOutputs:", await p.auditAiOutput.count());

  const eng = await p.auditEngagement.findFirst({ where: { id: "eng-gulf-2025" } });
  console.log("eng-gulf-2025:", !!eng, "status:", eng?.status ?? "N/A");

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
