/**
 * Platform Organization Link Verification Script
 *
 * Reports all Organization and AuditOrganization records and their
 * PlatformOrganization link status.
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

interface LinkStatus {
  type: string;
  id: string;
  name: string;
  slug?: string;
  linked: boolean;
  platformOrgId: string | null;
  platformOrgSlug: string | null;
  platformOrgName: string | null;
  platformOrgStatus: string | null;
}

async function main() {
  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  const results: LinkStatus[] = [];

  // DecisionOS organizations
  const decisionOrgs = await prisma.organization.findMany({
    include: {
      platformOrganization: {
        select: { id: true, slug: true, name: true, status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  for (const org of decisionOrgs) {
    results.push({
      type: "Organization (DecisionOS)",
      id: org.id,
      name: org.name,
      linked: !!org.platformOrganization,
      platformOrgId: org.platformOrganization?.id ?? null,
      platformOrgSlug: org.platformOrganization?.slug ?? null,
      platformOrgName: org.platformOrganization?.name ?? null,
      platformOrgStatus: org.platformOrganization?.status ?? null,
    });
  }

  // AuditOS organizations
  const auditOrgs = await prisma.auditOrganization.findMany({
    include: {
      platformOrganization: {
        select: { id: true, slug: true, name: true, status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  for (const org of auditOrgs) {
    results.push({
      type: "AuditOrganization (AuditOS)",
      id: org.id,
      name: org.name,
      slug: org.slug,
      linked: !!org.platformOrganization,
      platformOrgId: org.platformOrganization?.id ?? null,
      platformOrgSlug: org.platformOrganization?.slug ?? null,
      platformOrgName: org.platformOrganization?.name ?? null,
      platformOrgStatus: org.platformOrganization?.status ?? null,
    });
  }

  // PlatformOrganization count
  const platformOrgCount = await prisma.platformOrganization.count();

  // Summary
  const total = results.length;
  const linked = results.filter((r) => r.linked).length;
  const unlinked = results.filter((r) => !r.linked).length;

  console.log("\n=== Platform Organization Link Verification ===\n");
  console.log(`PlatformOrganization records: ${platformOrgCount}\n`);

  for (const r of results) {
    const status = r.linked ? "✅ LINKED" : "❌ UNLINKED";
    console.log(`  ${status}  ${r.type}`);
    console.log(`         ID:   ${r.id}`);
    console.log(`         Name: ${r.name}`);
    if (r.slug) console.log(`         Slug: ${r.slug}`);
    if (r.linked) {
      console.log(
        `         → PlatformOrg: ${r.platformOrgSlug} (${r.platformOrgName}) [${r.platformOrgStatus}]`,
      );
    }
    console.log();
  }

  console.log("═".repeat(55));
  console.log("SUMMARY");
  console.log("═".repeat(55));
  console.log(`  Total legacy organization records: ${total}`);
  console.log(`  Linked to PlatformOrganization:   ${linked}`);
  console.log(`  Not linked:                       ${unlinked}`);
  console.log(
    `  Coverage:                         ${total > 0 ? ((linked / total) * 100).toFixed(1) : "N/A"}%\n`,
  );

  if (unlinked > 0) {
    console.log("── Unlinked Records ──");
    for (const r of results.filter((r) => !r.linked)) {
      console.log(`  • ${r.type}: ${r.name} (${r.id})`);
    }
    console.log();
  }

  if (linked === total) {
    console.log(
      "✅ All legacy organization records are linked to PlatformOrganization.\n",
    );
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("\n❌ Verification failed:", err);
  process.exit(1);
});
