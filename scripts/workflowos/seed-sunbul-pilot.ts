/**
 * Sunbul Pilot Seed Script
 *
 * Creates a pilot client with sample users and records for testing.
 * Does NOT reset the database or modify existing data.
 *
 * Prefix: sunbul-pilot-
 *
 * Usage: npx tsx scripts/seed-sunbul-pilot.ts
 *
 * Prerequisites: AQLIYA seed users must exist (run `npx tsx prisma/seed.ts`)
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";
const adapter = new PrismaPg(DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const PREFIX = "sunbul-pilot";

async function main() {
  console.log("Sunbul Pilot Seed Script");
  console.log("=".repeat(50));

  // Find AQLIYA users
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@aqliya.com" },
  });
  const operatorUser = await prisma.user.findUnique({
    where: { email: "sara@aqliya.com" },
  });

  if (!adminUser || !operatorUser) {
    console.log(
      "❌ Required users not found. Run `npx tsx prisma/seed.ts` first.",
    );
    console.log("   Need: admin@aqliya.com, sara@aqliya.com");
    process.exit(1);
  }

  // Create pilot client
  const existing = await prisma.sunbulClient.findUnique({
    where: { slug: `${PREFIX}-client` },
  });
  if (existing) {
    console.log(
      `ℹ️  Pilot client already exists: ${existing.name} (${existing.id})`,
    );
    console.log(
      "   Skipping creation. Use scripts/validate-sunbul-e2e.ts for fresh test data.",
    );
    await prisma.$disconnect();
    return;
  }

  const client = await prisma.sunbulClient.create({
    data: {
      name: "Pilot Client — العميل التجريبي",
      slug: `${PREFIX}-client`,
    },
  });
  console.log(`✅ Created client: ${client.name}`);

  // Create memberships
  await prisma.sunbulUserMembership.create({
    data: { clientId: client.id, userId: adminUser.id, role: "PlatformAdmin" },
  });
  console.log(`✅ PlatformAdmin membership: ${adminUser.email}`);

  await prisma.sunbulUserMembership.create({
    data: { clientId: client.id, userId: operatorUser.id, role: "Operator" },
  });
  console.log(`✅ Operator membership: ${operatorUser.email}`);

  // Create sample records
  const draftRecord = await prisma.sunbulRecord.create({
    data: {
      clientId: client.id,
      title: "[PILOT] عينة — طلب تدقيق مالي",
      description:
        "نموذج تجريبي لقضية في حالة مسودة. تستخدم لأغراض الاختبار والتجربة.",
      status: "Draft",
      createdById: operatorUser.id,
    },
  });
  console.log(`✅ Draft record created: ${draftRecord.title}`);

  const approvedRecord = await prisma.sunbulRecord.create({
    data: {
      clientId: client.id,
      title: "[PILOT] عينة — تقرير امتثال معتمد",
      description:
        "نموذج تجريبي لقضية في حالة معتمد. يمكن استخدامها لاختبار التصدير.",
      status: "Approved",
      createdById: operatorUser.id,
      submittedAt: new Date(Date.now() - 86400000 * 3),
      approvedAt: new Date(Date.now() - 86400000),
    },
  });
  console.log(`✅ Approved record created: ${approvedRecord.title}`);

  // Create sample document for approved record
  await prisma.sunbulDocument.create({
    data: {
      clientId: client.id,
      recordId: approvedRecord.id,
      fileName: "sample-report.pdf",
      fileType: "application/pdf",
      fileSize: 51200,
      storageKey: `metadata-only:pilot-${Date.now()}`,
      uploadedById: operatorUser.id,
    },
  });
  console.log("✅ Sample document metadata created for approved record");

  // Create audit events
  for (const record of [draftRecord, approvedRecord]) {
    await prisma.sunbulAuditEvent.create({
      data: {
        clientId: client.id,
        recordId: record.id,
        actorId: operatorUser.id,
        action: "RECORD_CREATED",
        entityType: "SunbulRecord",
        entityId: record.id,
        metadata: { title: record.title },
      },
    });
  }

  if (approvedRecord.approvedAt) {
    await prisma.sunbulAuditEvent.create({
      data: {
        clientId: client.id,
        recordId: approvedRecord.id,
        actorId: adminUser.id,
        action: "RECORD_SUBMITTED",
        entityType: "SunbulRecord",
        entityId: approvedRecord.id,
        metadata: { previousStatus: "Draft", newStatus: "UnderReview" },
      },
    });
    await prisma.sunbulAuditEvent.create({
      data: {
        clientId: client.id,
        recordId: approvedRecord.id,
        actorId: adminUser.id,
        action: "RECORD_APPROVED",
        entityType: "SunbulRecord",
        entityId: approvedRecord.id,
        metadata: { previousStatus: "UnderReview", newStatus: "Approved" },
      },
    });
  }

  console.log("✅ Sample audit events created");
  console.log();
  console.log("=".repeat(50));
  console.log("Pilot seed complete!");
  console.log();
  console.log("Login credentials:");
  console.log("  PlatformAdmin: admin@aqliya.com / admin123");
  console.log("  Operator:      sara@aqliya.com / operator123");
  console.log();
  console.log("Pilot client: Pilot Client — العميل التجريبي");
  console.log("Sample records:");
  console.log(`  Draft:     ${draftRecord.title}`);
  console.log(`  Approved:  ${approvedRecord.title}`);
  console.log();
  console.log(
    "Navigate to /sunbul and select the pilot client from the dropdown.",
  );

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
