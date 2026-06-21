import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const p = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) });

async function main() {
  const r: Record<string, number> = {};

  r.PlatformOrgs = await p.platformOrganization.count();
  r.ClientWorkspaces = await p.clientWorkspace.count();
  r.Organizations = await p.organization.count();
  r.Users = await p.user.count();
  r.Decisions = await p.decision.count();
  r.AuditEngagements = await p.auditEngagement.count();
  r.AuditEvents = await p.auditEvent.count();
  r.AuditEvidence = await p.auditEvidence.count();
  r.AuditFindings = await p.auditFinding.count();
  r.AuditReviewComments = await p.auditReviewComment.count();
  r.AuditApprovalRecords = await p.auditApprovalRecord.count();
  r.AuditRecommendations = await p.auditRecommendation.count();
  r.AuditAiOutputs = await p.auditAiOutput.count();
  r.LCProjects = await p.localContentProject.count();
  r.LCAuditEvents = await p.localContentAuditEvent.count();
  r.SalesAccounts = await p.salesAccount.count();
  r.SalesContacts = await p.salesContact.count();
  r.SalesDeals = await p.salesDeal.count();
  r.PlatformAuditLogs = await p.platformAuditLog.count();

  for (const [k, v] of Object.entries(r)) {
    console.log(`${k}: ${v}`);
  }

  // Check eng-gulf-2025 specifically
  const eng = await p.auditEngagement.findFirst({ where: { id: "eng-gulf-2025" } });
  console.log(`eng-gulf-2025 exists: ${!!eng}, status: ${eng?.status ?? "N/A"}`);

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
