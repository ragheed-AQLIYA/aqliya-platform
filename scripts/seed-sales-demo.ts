/**
 * SalesOS Demo Seed — idempotent Prisma seed for L5 relational workspace.
 *
 * Creates default pipeline, stages, demo accounts, deals, and one interaction
 * for the AQLIYA demo organization (admin@aqliya.com org).
 *
 * Usage:
 *   npx tsx scripts/seed-sales-demo.ts
 *
 * Prerequisites: `npx prisma db seed` (core users + org must exist).
 */

import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: resolve(__dirname, "../.env") });

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const DEMO_SLUG = "aqliya-demo-pipeline";

async function main() {
  console.log("SalesOS demo seed");
  console.log("=".repeat(50));

  const org = await prisma.organization.findFirst({
    where: { name: { contains: "AQLIYA Demo" } },
    orderBy: { createdAt: "asc" },
  });

  if (!org) {
    console.error("❌ Demo organization not found. Run `npx prisma db seed` first.");
    process.exit(1);
  }

  const admin = await prisma.user.findUnique({
    where: { email: "admin@aqliya.com" },
  });

  if (!admin) {
    console.error("❌ admin@aqliya.com not found. Run `npx prisma db seed` first.");
    process.exit(1);
  }

  const platformOrgId = org.platformOrganizationId ?? undefined;

  let pipeline = await prisma.salesPipeline.findFirst({
    where: { organizationId: org.id, slug: DEMO_SLUG },
  });

  if (!pipeline) {
    pipeline = await prisma.salesPipeline.create({
      data: {
        organizationId: org.id,
        platformOrganizationId: platformOrgId ?? null,
        name: "Enterprise Pipeline",
        slug: DEMO_SLUG,
        isDefault: true,
        status: "active",
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
    console.log(`✅ Created pipeline: ${pipeline.name}`);
  } else {
    console.log(`ℹ️  Pipeline exists: ${pipeline.name}`);
  }

  const stageDefs = [
    { name: "Discovery", slug: "discovery", sortOrder: 1, isClosed: false },
    { name: "Proposal", slug: "proposal_commercial_review", sortOrder: 2, isClosed: false },
    { name: "Pilot", slug: "pilot_active", sortOrder: 3, isClosed: false },
    { name: "Won", slug: "won", sortOrder: 4, isClosed: true },
    { name: "Lost", slug: "lost", sortOrder: 5, isClosed: true },
  ];

  const stages: Record<string, string> = {};
  for (const def of stageDefs) {
    const existing = await prisma.salesPipelineStage.findFirst({
      where: { pipelineId: pipeline.id, slug: def.slug },
    });
    if (existing) {
      stages[def.slug] = existing.id;
    } else {
      const stage = await prisma.salesPipelineStage.create({
        data: {
          pipelineId: pipeline.id,
          organizationId: org.id,
          platformOrganizationId: platformOrgId ?? null,
          name: def.name,
          slug: def.slug,
          sortOrder: def.sortOrder,
          isClosed: def.isClosed,
          status: "active",
        },
      });
      stages[def.slug] = stage.id;
      console.log(`  ✅ Stage: ${def.name}`);
    }
  }

  const accountDefs = [
    { name: "Acme Corp KSA", industry: "Technology", isDemo: true },
    { name: "Global Finance Group", industry: "Financial Services", isDemo: true },
    { name: "DataFlow Analytics", industry: "Data Analytics", isDemo: true },
  ];

  const accountIds: string[] = [];
  for (const def of accountDefs) {
    let account = await prisma.salesAccount.findFirst({
      where: { organizationId: org.id, name: def.name },
    });
    if (!account) {
      account = await prisma.salesAccount.create({
        data: {
          organizationId: org.id,
          platformOrganizationId: platformOrgId ?? null,
          name: def.name,
          industry: def.industry,
          isDemo: def.isDemo,
          status: "active",
          createdById: admin.id,
          updatedById: admin.id,
        },
      });
      console.log(`✅ Account: ${account.name}`);
    } else {
      console.log(`ℹ️  Account exists: ${account.name}`);
    }
    accountIds.push(account.id);
  }

  const dealDefs = [
    {
      title: "AuditOS Enterprise License",
      accountIdx: 0,
      stageSlug: "discovery",
      amount: 480_000,
      probability: 40,
    },
    {
      title: "Institutional Suite Pilot",
      accountIdx: 1,
      stageSlug: "proposal_commercial_review",
      amount: 720_000,
      probability: 65,
    },
    {
      title: "LocalContentOS Assessment",
      accountIdx: 2,
      stageSlug: "pilot_active",
      amount: 250_000,
      probability: 55,
    },
  ];

  for (const def of dealDefs) {
    const existing = await prisma.salesDeal.findFirst({
      where: { organizationId: org.id, title: def.title },
    });
    if (existing) {
      console.log(`ℹ️  Deal exists: ${def.title}`);
      continue;
    }

    const deal = await prisma.salesDeal.create({
      data: {
        organizationId: org.id,
        platformOrganizationId: platformOrgId ?? null,
        accountId: accountIds[def.accountIdx]!,
        stageId: stages[def.stageSlug] ?? null,
        title: def.title,
        status: "open",
        amount: def.amount,
        currency: "SAR",
        probability: def.probability,
        isDemo: true,
        createdById: admin.id,
        updatedById: admin.id,
      },
    });
    console.log(`✅ Deal: ${deal.title}`);

    await prisma.salesInteraction.create({
      data: {
        organizationId: org.id,
        platformOrganizationId: platformOrgId ?? null,
        accountId: accountIds[def.accountIdx]!,
        dealId: deal.id,
        type: "meeting",
        summary: `Demo discovery — ${def.title}`,
        occurredAt: new Date(),
        createdById: admin.id,
      },
    });
  }

  console.log("");
  console.log("SalesOS demo seed complete.");
  console.log(`Organization: ${org.name} (${org.id})`);
  console.log(`Pipeline: ${pipeline.slug}`);
  console.log(`Accounts: ${accountIds.length}, Deals: ${dealDefs.length} (idempotent)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
