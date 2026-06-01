/** Ensure admin@aqliya.com has an AuditUser row linked to the demo audit org. Idempotent. */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config();
const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) });

async function main() {
  const platformOrg = await prisma.platformOrganization.findUnique({
    where: { slug: "aqliya-demo" },
  });
  if (!platformOrg) {
    throw new Error("PlatformOrganization aqliya-demo not found — run prisma db seed first");
  }

  let auditOrg = await prisma.auditOrganization.findFirst({
    where: { platformOrganizationId: platformOrg.id },
  });

  if (!auditOrg) {
    auditOrg = await prisma.auditOrganization.create({
      data: {
        id: "org-aqliya",
        name: "Aqliya Audit Firm",
        slug: "aqliya-audit",
        jurisdiction: "Saudi Arabia",
        regulatoryFramework: "IFRS for SMEs",
        governanceRules: { requireEvidenceForMaterialFindings: true, maxApprovalDays: 14 },
        status: "active",
        platformOrganizationId: platformOrg.id,
      },
    });
    console.log("Created audit organization:", auditOrg.slug);
  }

  const existing = await prisma.auditUser.findFirst({
    where: { organizationId: auditOrg.id, email: "admin@aqliya.com" },
  });

  if (existing) {
    console.log("AuditUser already exists:", existing.id, existing.role);
    return;
  }

  const user = await prisma.auditUser.create({
    data: {
      id: "usr-admin",
      organizationId: auditOrg.id,
      email: "admin@aqliya.com",
      name: "Admin User",
      role: "admin",
      status: "active",
      createdById: "usr-admin",
    },
  });
  console.log("Created AuditUser:", user.id, user.email, user.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
