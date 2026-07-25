/**
 * Performance Scanner Golden Dataset
 *
 * Each case represents a code snippet that the performance scanner should
 * either flag (TP), ignore (FP/AR), or pass cleanly (NA).
 *
 * Categories:
 *   TP = True Positive (should be flagged)
 *   FP = False Positive (was previously incorrectly flagged, now excluded)
 *   AR = Accepted Risk (flagged but intentionally kept)
 *   NA = Clean / No Action (should produce zero findings)
 */

export interface PerformanceGoldenCase {
  id: string;
  input: string;
  filename: string;
  expected: "TP" | "FP" | "AR" | "NA";
  rule?: string;
  description: string;
}

// ─── True Positives ────────────────────────────────────────────────

export const truePositives: PerformanceGoldenCase[] = [
  {
    id: "TP-PERF-001",
    input: `const users = await prisma.user.findMany();
for (const user of users) {
  const orders = await prisma.order.findMany({ where: { userId: user.id } });
  user.orders = orders;
}`,
    filename: "src/actions/listUsers.ts",
    expected: "TP",
    rule: "n-plus-one",
    description: "Classic N+1: for loop with await prisma inside (sequential queries)",
  },
  {
    id: "TP-PERF-002",
    input: `const items = await prisma.item.findMany();
items.map(async (item) => {
  const details = await prisma.itemDetail.findUnique({ where: { itemId: item.id } });
  return { ...item, details };
});`,
    filename: "src/lib/data-loader.ts",
    expected: "TP",
    rule: "n-plus-one",
    description: "N+1: .map(async) with await prisma inside (NOT wrapped in Promise.all)",
  },
  {
    id: "TP-PERF-003",
    input: `const allUsers = await prisma.user.findMany();
// Returns ALL users with no limit`,
    filename: "src/app/api/users/route.ts",
    expected: "TP",
    rule: "unbounded-query",
    description: "findMany without take/limit in API route (unbounded query)",
  },
  {
    id: "TP-PERF-004",
    input: `"use client";\n${Array.from({ length: 500 }, (_, i) => `  const line${i} = ${i};`).join("\n")}\nexport function HeavyComponent() { return <div>heavy</div>; }`,
    filename: "src/components/Dashboard.tsx",
    expected: "TP",
    rule: "large-client",
    description: "Large client component (>=400 lines with 'use client')",
  },
];

// ─── False Positives (previously caught, now excluded) ─────────────

export const falsePositives: PerformanceGoldenCase[] = [
  {
    id: "FP-PERF-001",
    input: `import { PrismaClient } from "@prisma/client";\nconst prisma = new PrismaClient();\nawait prisma.user.create({ data: { name: "test" } });\nawait prisma.user.create({ data: { name: "test2" } });`,
    filename: "prisma/seed.ts",
    expected: "FP",
    rule: "n-plus-one",
    description: "Seed files excluded by EXCLUDE_PATTERNS (prisma/seed*.ts)",
  },
  {
    id: "FP-PERF-002",
    input: `const mockUser = { id: "1", name: "Test" };\njest.mock("@prisma/client");\nawait prisma.user.findMany();`,
    filename: "src/__tests__/user.test.ts",
    expected: "FP",
    rule: "n-plus-one",
    description: "Test files excluded by EXCLUDE_PATTERNS (__tests__)",
  },
  {
    id: "FP-PERF-003",
    input: `const results = await Promise.all(\n  items.map(async (item) => {\n    const detail = await prisma.detail.findUnique({ where: { id: item.id } });\n    return detail;\n  })\n);`,
    filename: "src/lib/batch-loader.ts",
    expected: "FP",
    rule: "n-plus-one",
    description: "Promise.all-wrapped .map(async) — parallelized, not sequential N+1",
  },
  {
    id: "FP-PERF-004",
    input: `/**\n * Example: const users = await prisma.user.findMany();\n * This returns all users from the database.\n */`,
    filename: "src/lib/docs.ts",
    expected: "FP",
    rule: "unbounded-query",
    description: "findMany in JSDoc comment (codeOnly strip removes comments before matching)",
  },
  {
    id: "FP-PERF-005",
    input: `const recentPosts = await prisma.post.findMany({ take: 10, orderBy: { createdAt: "desc" } });`,
    filename: "src/actions/getPosts.ts",
    expected: "FP",
    rule: "unbounded-query",
    description: "findMany with take:10 — properly bounded query (has take in file)",
  },
];

// ─── Accepted Risks ────────────────────────────────────────────────

export const acceptedRisks: PerformanceGoldenCase[] = [
  {
    id: "AR-PERF-001",
    input: `const a = await prisma.user.findUnique({ where: { id: userId } });\nconst b = await prisma.org.findUnique({ where: { id: a.orgId } });\nconst c = await prisma.role.findUnique({ where: { id: b.roleId } });`,
    filename: "src/lib/auth-resolver.ts",
    expected: "AR",
    rule: "sequential-await",
    description: "Sequential awaits for dependent data — each depends on previous result",
  },
];

// ─── Clean Cases (zero findings expected) ──────────────────────────

export const cleanCases: PerformanceGoldenCase[] = [
  {
    id: "NA-PERF-001",
    input: `const userIds = items.map(i => i.userId);\nconst users = await prisma.user.findMany({ where: { id: { in: userIds } }, take: 100 });`,
    filename: "src/lib/batch.ts",
    expected: "NA",
    description: "Batched query with where id in [...] and take limit",
  },
  {
    id: "NA-PERF-002",
    input: `export default function Page() {\n  return (\n    <div>\n      <h1>Dashboard</h1>\n      <p>Server-rendered content</p>\n    </div>\n  );\n}`,
    filename: "src/app/dashboard/page.tsx",
    expected: "NA",
    description: "Server Component (no 'use client') — no client bundle concern",
  },
  {
    id: "NA-PERF-003",
    input: `"use client";\nimport { useState } from "react";\nexport function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;\n}`,
    filename: "src/components/Counter.tsx",
    expected: "NA",
    description: "Small client component — no performance concerns",
  },
  {
    id: "NA-PERF-004",
    input: `const page = await prisma.post.findMany({ take: 20, skip: 0, orderBy: { createdAt: "desc" }, include: { author: true } });`,
    filename: "src/actions/getPosts.ts",
    expected: "NA",
    description: "Paginated findMany with take and skip",
  },
];
