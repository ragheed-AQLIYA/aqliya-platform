#!/usr/bin/env node
import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: resolve(process.cwd(), ".env") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("NO_DATABASE_URL");
  process.exit(2);
}

const prisma = new PrismaClient({ adapter: new PrismaPg(url) });

try {
  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ["admin@aqliya.com", "sara@aqliya.com", "mohammad@aqliya.com"],
      },
    },
    select: { email: true, role: true, passwordHash: true },
  });

  let kfVersions = null;
  let miningCandidates = null;
  let failedReleaseRows = null;
  let kfSchemaPresent = true;

  try {
    kfVersions = await prisma.knowledgeFoundationVersion.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    miningCandidates = {
      PROMOTED: await prisma.knowledgeCandidate.count({ where: { status: "PROMOTED" } }),
      APPROVED: await prisma.knowledgeCandidate.count({ where: { status: "APPROVED" } }),
      CANDIDATE: await prisma.knowledgeCandidate.count({ where: { status: "CANDIDATE" } }),
    };
    failedReleaseRows = await prisma.knowledgeFoundationRelease.count({
      where: { artifactStatus: "FAILED" },
    });
  } catch (err) {
    kfSchemaPresent = false;
    kfVersions = { error: err instanceof Error ? err.message : String(err) };
  }

  console.log(
    JSON.stringify(
      {
        databaseUrlHost: (() => {
          try {
            return new URL(url.replace(/^postgresql:/, "http:")).host;
          } catch {
            return "unparseable";
          }
        })(),
        users: users.map((u) => ({
          email: u.email,
          role: u.role,
          hasPasswordHash: Boolean(u.passwordHash),
        })),
        kfSchemaPresent,
        kfVersionsByStatus: kfVersions,
        miningCandidates,
        failedReleaseRows,
      },
      null,
      2,
    ),
  );
} finally {
  await prisma.$disconnect();
}
