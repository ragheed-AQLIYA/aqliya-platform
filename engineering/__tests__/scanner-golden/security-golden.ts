/**
 * Security Scanner Golden Dataset
 *
 * Each case represents a code snippet that the security scanner should
 * either flag (TP), ignore (FP/AR), or pass cleanly (NA).
 *
 * Categories:
 *   TP = True Positive (should be flagged)
 *   FP = False Positive (was previously incorrectly flagged, now excluded)
 *   AR = Accepted Risk (flagged but intentionally kept)
 *   NA = Clean / No Action (should produce zero findings)
 */

export interface SecurityGoldenCase {
  id: string;
  input: string;
  filename: string;
  expected: "TP" | "FP" | "AR" | "NA";
  rule?: string;
  description: string;
}

// ─── True Positives ────────────────────────────────────────────────

export const truePositives: SecurityGoldenCase[] = [
  {
    id: "TP-SEC-001",
    input: `const AWS_KEY = "AKIAIOSFODNN7EXAMPLE";`,
    filename: "src/lib/config.ts",
    expected: "TP",
    rule: "aws-key",
    description: "Hardcoded AWS access key (AKIA pattern)",
  },
  {
    id: "TP-SEC-002",
    input: `const PRIVATE_KEY = "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...";`,
    filename: "src/lib/crypto.ts",
    expected: "TP",
    rule: "private-key",
    description: "Hardcoded RSA private key",
  },
  {
    id: "TP-SEC-003",
    input: `const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";`,
    filename: "src/lib/auth.ts",
    expected: "TP",
    rule: "jwt-hardcoded",
    description: "Hardcoded JWT token",
  },
  {
    id: "TP-SEC-004",
    input: `const result = eval("1 + 2");`,
    filename: "src/lib/utils.ts",
    expected: "TP",
    rule: "eval",
    description: "Direct eval() usage in application code",
  },
  {
    id: "TP-SEC-005",
    input: `import { execSync } from "child_process";\nconst output = execSync("ls -la");`,
    filename: "src/scripts/deploy.ts",
    expected: "TP",
    rule: "child-process",
    description: "child_process execSync usage",
  },
  {
    id: "TP-SEC-006",
    input: `<div dangerouslySetInnerHTML={{ __html: userInput }} />`,
    filename: "src/components/Comment.tsx",
    expected: "TP",
    rule: "dangerouslySetInnerHTML",
    description: "dangerouslySetInnerHTML in client component without sanitize",
  },
  {
    id: "TP-SEC-007",
    input: `const data = await fetch(dynamicUrl);`,
    filename: "src/app/api/proxy/route.ts",
    expected: "TP",
    rule: "ssrf",
    description: "SSRF: fetch with dynamic input in API route",
  },
  {
    id: "TP-SEC-008",
    input: `const apiKey = "sk-1234567890abcdef1234567890abcdef"`,
    filename: "src/lib/integrations.ts",
    expected: "TP",
    rule: "generic-secret",
    description: "Hardcoded API key (no trailing semicolon to avoid overly broad exclude pattern)",
  },
];

// ─── False Positives (previously caught, now excluded) ─────────────

export const falsePositives: SecurityGoldenCase[] = [
  {
    id: "FP-SEC-001",
    input: `const match = regex.exec(inputString);`,
    filename: "src/lib/parser.ts",
    expected: "FP",
    rule: "child-process",
    description: "F-0003: RegExp.exec() matching as child_process (negative lookbehind excludes dot-prefixed exec)",
  },
  {
    id: "FP-SEC-002",
    input: `const result = await client.eval("return redis.get(key)");`,
    filename: "src/lib/cache.ts",
    expected: "FP",
    rule: "eval",
    description: "Redis EVAL command matching as JS eval (negative lookbehind excludes dot-prefixed eval)",
  },
  {
    id: "FP-SEC-003",
    input: `// Arabic UI label\nconst label = "اسم المستخدم: admin@example.com";`,
    filename: "src/components/LoginForm.tsx",
    expected: "FP",
    rule: "generic-secret",
    description: "Arabic UI labels matching as secrets (exclude pattern filters URLs and UI text)",
  },
  {
    id: "FP-SEC-004",
    input: `const apiUrl = "https://api.example.com/v1?key=secret123";`,
    filename: "src/lib/config.ts",
    expected: "FP",
    rule: "generic-secret",
    description: "URL strings matching as secrets (exclude pattern filters URLs)",
  },
  {
    id: "FP-SEC-005",
    input: `import type { User } from "@prisma/client";\nimport type { Role } from "@prisma/client";`,
    filename: "src/types/index.ts",
    expected: "FP",
    rule: "generic-secret",
    description: "Type-only imports from @prisma/client (excluded by file patterns or no actual secret match)",
  },
  {
    id: "FP-SEC-006",
    input: `const mockToken = "test-token-for-unit-tests";\nexpect(result).toBe(true);`,
    filename: "src/__tests__/auth.test.ts",
    expected: "FP",
    rule: "generic-secret",
    description: "Test files with mock tokens (excluded by fileExclusions pattern __tests__)",
  },
  {
    id: "FP-SEC-007",
    input: `const apiKey = process.env.API_KEY;`,
    filename: "src/lib/config.ts",
    expected: "FP",
    rule: "generic-secret",
    description: "Environment variable reference matching as secret (exclude pattern filters process.env)",
  },
  {
    id: "FP-SEC-008",
    input: `token: string; // type definition`,
    filename: "src/types/auth.ts",
    expected: "FP",
    rule: "generic-secret",
    description: "Type definition with 'token' keyword (exclude pattern filters interface/type definitions)",
  },
];

// ─── Accepted Risks ────────────────────────────────────────────────

export const acceptedRisks: SecurityGoldenCase[] = [
  {
    id: "AR-SEC-001",
    input: `const result = await prisma.$queryRaw\`SELECT * FROM users\`;`,
    filename: "src/lib/db-utils.ts",
    expected: "AR",
    rule: "raw-sql",
    description: "Health check $queryRaw usage — accepted risk with documented reason",
  },
  {
    id: "AR-SEC-002",
    input: `export async function GET() {\n  return Response.json({ status: "ok" });\n}`,
    filename: "src/app/api/platform/health/route.ts",
    expected: "AR",
    rule: "api-route-auth",
    description: "Health check endpoint — intentionally public (excluded by /health/ pattern)",
  },
  {
    id: "AR-SEC-003",
    input: `export default NextAuth({ providers: [Credentials({...})] });`,
    filename: "src/app/api/auth/[...nextauth]/route.ts",
    expected: "AR",
    rule: "api-route-auth",
    description: "NextAuth catch-all route — auth framework handles its own security",
  },
  {
    id: "AR-SEC-004",
    input: `"use client";\nimport { useState } from "react";\nexport function Comment({ html }: { html: string }) {\n  const sanitized = DOMPurify.sanitize(html);\n  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;\n}`,
    filename: "src/components/Comment.tsx",
    expected: "AR",
    rule: "dangerouslySetInnerHTML",
    description: "Client dangerouslySetInnerHTML with DOMPurify — flagged by raw dangerousApis pattern (accepted: sanitize present, XSS check passes)",
  },
];

// ─── Clean Cases (zero findings expected) ──────────────────────────

export const cleanCases: SecurityGoldenCase[] = [
  {
    id: "NA-SEC-001",
    input: `export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });
  const data = await prisma.user.findMany({ where: { organizationId: session.user.orgId } });
  return Response.json(data);
}`,
    filename: "src/app/api/users/route.ts",
    expected: "NA",
    description: "Proper auth guard (getServerSession) with tenant scope (organizationId)",
  },
  {
    id: "NA-SEC-002",
    input: `export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  await prisma.platformAuditLog.create({ data: { userId: user.id, action: "create" } });
  return Response.json({ ok: true });
}`,
    filename: "src/actions/createAuditLog.ts",
    expected: "NA",
    description: "Server action with getCurrentUser auth guard",
  },
  {
    id: "NA-SEC-003",
    input: `const apiUrl = process.env.EXTERNAL_API_URL;\nconst response = await fetch(apiUrl);`,
    filename: "src/lib/integrations.ts",
    expected: "NA",
    description: "fetch with environment variable URL (not user-controlled)",
  },
  {
    id: "NA-SEC-004",
    input: `export async function PATCH(req: Request) {
  const session = await auth();
  enforce({ session, role: "admin" });
  const body = await req.json();
  await prisma.organization.update({ where: { id: body.id }, data: body });
  return Response.json({ ok: true });
}`,
    filename: "src/app/api/admin/org/route.ts",
    expected: "NA",
    description: "API route with enforce() auth guard and role check",
  },
];
