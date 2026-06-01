/**
 * SunbulClient platformOrganizationId backfill
 *
 * Links WorkflowOS SunbulClient records to PlatformOrganization when a
 * matching DecisionOS Organization or AuditOrganization bridge exists.
 *
 * Usage:
 *   Dry run:  tsx scripts/backfill-sunbul-platform-org.ts
 *   Apply:    tsx scripts/backfill-sunbul-platform-org.ts --apply
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const isApply = process.argv.includes("--apply");
  console.log(`\nSunbulClient platformOrganizationId backfill — ${isApply ? "APPLY" : "DRY RUN"}\n`);

  const adapter = new PrismaPg(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter });

  try {
    const clients = await prisma.sunbulClient.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        platformOrganizationId: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const alreadyLinked = clients.filter((c) => c.platformOrganizationId);
    const unlinked = clients.filter((c) => !c.platformOrganizationId);

    console.log(`Total SunbulClient: ${clients.length}`);
    console.log(`Already linked:     ${alreadyLinked.length}`);
    console.log(`Needs backfill:     ${unlinked.length}\n`);

    let linked = 0;
    let unmatched = 0;

    for (const client of unlinked) {
      const normalized = client.name.trim().toLowerCase();

      const decisionOrg = await prisma.organization.findFirst({
        where: {
          platformOrganizationId: { not: null },
          name: { equals: client.name, mode: "insensitive" },
        },
        select: { platformOrganizationId: true, name: true },
      });

      const auditOrg = decisionOrg
        ? null
        : await prisma.auditOrganization.findFirst({
            where: {
              platformOrganizationId: { not: null },
              OR: [
                { name: { equals: client.name, mode: "insensitive" } },
                { slug: client.slug },
              ],
            },
            select: { platformOrganizationId: true, name: true },
          });

      const platformOrgId =
        decisionOrg?.platformOrganizationId ??
        auditOrg?.platformOrganizationId ??
        null;

      if (!platformOrgId) {
        console.log(`  ✗ No match: ${client.name} (${client.id})`);
        unmatched++;
        continue;
      }

      console.log(
        `  → ${client.name} → platformOrg ${platformOrgId}${isApply ? " [APPLY]" : ""}`,
      );

      if (isApply) {
        await prisma.sunbulClient.update({
          where: { id: client.id },
          data: { platformOrganizationId: platformOrgId },
        });
      }
      linked++;
    }

    console.log(`\nLinked: ${linked}, Unmatched: ${unmatched}`);
    if (!isApply) {
      console.log("Run with --apply to persist changes.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
