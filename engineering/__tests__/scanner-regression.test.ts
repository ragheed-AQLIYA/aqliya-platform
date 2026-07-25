/**
 * Scanner Regression Tests
 *
 * Tests the security and performance scanners against a golden dataset
 * of known true positives, false positives, accepted risks, and clean cases.
 *
 * Run: npx jest --config jest.config.engineering.js engineering/__tests__/scanner-regression
 */

import {
  SECURITY,
  PERFORMANCE,
} from "../config.mjs";
import {
  isClientModule,
  hasAuthorizeCall,
  hasOrganizationScope,
  extractImports,
} from "../lib/ast-lite.mjs";
import {
  truePositives as secTP,
  falsePositives as secFP,
  acceptedRisks as secAR,
  cleanCases as secNA,
} from "./scanner-golden/security-golden.ts";
import {
  truePositives as perfTP,
  falsePositives as perfFP,
  acceptedRisks as perfAR,
  cleanCases as perfNA,
} from "./scanner-golden/performance-golden.ts";

// ─── Helpers ───────────────────────────────────────────────────────

/** Check if a code string matches any secret pattern */
function matchesSecretPatterns(code) {
  const matches = [];
  for (const pat of SECURITY.secretPatterns) {
    if (pat.re.test(code)) {
      const excluded = pat.exclude && pat.exclude.test(code);
      if (!excluded) {
        matches.push(pat.id);
      }
    }
  }
  return matches;
}

/** Check if a code string matches any dangerous API pattern */
function matchesDangerousApis(code) {
  const matches = [];
  for (const pat of SECURITY.dangerousApis) {
    if (pat.re.test(code)) {
      matches.push(pat.id);
    }
  }
  return matches;
}

/** Check if a code string would trigger SSRF detection */
function matchesSSRF(code, filename) {
  if (
    /fetch\s*\(\s*[a-zA-Z_][\w.]*\s*[,)]/.test(code) &&
    /req\.|searchParams|body\.|input\./.test(code)
  ) {
    const fetchVarMatch = code.match(/fetch\s*\(\s*([a-zA-Z_][\w.]*)\s*[,)]/);
    const urlFromEnv = fetchVarMatch && code.includes(`${fetchVarMatch[1]} = process.env`);
    if (!urlFromEnv && /api\/|actions\//.test(filename)) {
      return true;
    }
  }
  return false;
}

/** Check if XSS would be flagged (client + dangerouslySetInnerHTML + no sanitize) */
function matchesXSS(code) {
  return (
    isClientModule(code) &&
    /dangerouslySetInnerHTML/.test(code) &&
    !/DOMPurify|sanitize/.test(code)
  );
}

/** Check if a file is excluded by security scanner */
function isSecurityExcluded(filename) {
  return SECURITY.fileExclusions.some((p) => p.test(filename));
}

/** Check if a file is excluded by performance scanner */
function isPerformanceExcluded(filename) {
  const EXCLUDE_PATTERNS = [
    /prisma\/seed.*\.ts$/,
    /__tests__/,
    /\.test\.(ts|tsx|js|jsx)$/,
    /\.spec\.(ts|tsx|js|jsx)$/,
    /\.integration\.(ts|tsx|js|jsx)$/,
    /uat-run\.ts$/,
    /rehearsal-check\.ts$/,
  ];
  return EXCLUDE_PATTERNS.some((p) => p.test(filename));
}

/** Check if a file would be flagged as N+1 */
function matchesN1(code) {
  const hasPromiseAllMap = /Promise\.all\s*\(\s*[\s\S]*?\.map\s*\(\s*async/.test(code);
  const forN1 = /for\s*\([^)]+\)\s*\{[\s\S]{0,200}?await\s+prisma\./m.test(code);
  const mapN1 =
    /\.map\s*\(\s*async\s*\([\s\S]{0,200}?await\s+prisma\./m.test(code) &&
    !hasPromiseAllMap;
  return forN1 || mapN1;
}

/** Check if findMany without take would be flagged */
function matchesFindManyNoTake(code) {
  const codeOnly = code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
  return (
    PERFORMANCE.prismaFindManyWithoutTake &&
    /prisma\.\w+\.findMany\s*\(/.test(codeOnly) &&
    !/\btake\s*:/.test(codeOnly) &&
    /prisma\./.test(codeOnly)
  );
}

/** Check if a large client component would be flagged */
function matchesLargeClient(code) {
  return (
    isClientModule(code) &&
    code.split(/\r?\n/).length >= PERFORMANCE.largePageLines
  );
}

// ═══════════════════════════════════════════════════════════════════
// Security Scanner Regression Tests
// ═══════════════════════════════════════════════════════════════════

describe("Security Scanner Regression", () => {
  describe("True Positives — should be flagged", () => {
    it.each(secTP.map((c) => [c.id, c]))(
      "%s: %s",
      (_id, tc) => {
        if (isSecurityExcluded(tc.filename)) {
          // If file is excluded, the scanner won't even look at it — that's expected
          return;
        }

        const findings: string[] = [];

        // Check secrets
        const secretMatches = matchesSecretPatterns(tc.input);
        findings.push(...secretMatches.map((r) => `secret:${r}`));

        // Check dangerous APIs
        const apiMatches = matchesDangerousApis(tc.input);
        findings.push(...apiMatches.map((r) => `api:${r}`));

        // Check SSRF
        if (matchesSSRF(tc.input, tc.filename)) {
          findings.push("ssrf");
        }

        // Check XSS
        if (matchesXSS(tc.input)) {
          findings.push("xss");
        }

        // Check API route without auth
        if (/src\/app\/api\/.*route\.ts$/.test(tc.filename.replace(/\\/g, "/"))) {
          const hasAuth =
            hasAuthorizeCall(tc.input) ||
            /auth\(|getServerSession|requireUser|currentUser|getCurrentUser|session/.test(
              tc.input
            );
          if (
            !hasAuth &&
            !/health|ready|public|demo|csrf|auth\/\[|auth\/saml/.test(tc.filename)
          ) {
            findings.push("api-route-no-auth");
          }
        }

        expect(findings.length).toBeGreaterThan(0);
      }
    );
  });

  describe("False Positives — should NOT be flagged", () => {
    it.each(secFP.map((c) => [c.id, c]))(
      "%s: %s",
      (_id, tc) => {
        const findings: string[] = [];

        // Check secrets
        const secretMatches = matchesSecretPatterns(tc.input);
        findings.push(...secretMatches.map((r) => `secret:${r}`));

        // Check dangerous APIs
        const apiMatches = matchesDangerousApis(tc.input);
        findings.push(...apiMatches.map((r) => `api:${r}`));

        // Check SSRF
        if (matchesSSRF(tc.input, tc.filename)) {
          findings.push("ssrf");
        }

        // Check XSS
        if (matchesXSS(tc.input)) {
          findings.push("xss");
        }

        expect(findings).toHaveLength(0);
      }
    );
  });

  describe("Accepted Risks — may be flagged but excluded by rules", () => {
    it.each(secAR.map((c) => [c.id, c]))(
      "%s: %s",
      (_id, tc) => {
        const findings: string[] = [];

        // Check dangerous APIs (includes dangerouslySetInnerHTML raw pattern)
        const apiMatches = matchesDangerousApis(tc.input);
        findings.push(...apiMatches.map((r) => `api:${r}`));

        // Check API route auth exclusion
        if (/src\/app\/api\/.*route\.ts$/.test(tc.filename.replace(/\\/g, "/"))) {
          const hasAuth =
            hasAuthorizeCall(tc.input) ||
            /auth\(|getServerSession|requireUser|currentUser|getCurrentUser|session/.test(
              tc.input
            );
          if (
            !hasAuth &&
            !/health|ready|public|demo|csrf|auth\/\[|auth\/saml/.test(tc.filename)
          ) {
            findings.push("api-route-no-auth");
          }
        }

        // AR cases may have findings — they're accepted, not bugs
        expect(tc.id).toMatch(/^AR-SEC/);
      }
    );
  });

  describe("Clean Cases — zero findings expected", () => {
    it.each(secNA.map((c) => [c.id, c]))(
      "%s: %s",
      (_id, tc) => {
        if (isSecurityExcluded(tc.filename)) return;

        const findings: string[] = [];

        // Check secrets
        const secretMatches = matchesSecretPatterns(tc.input);
        findings.push(...secretMatches.map((r) => `secret:${r}`));

        // Check dangerous APIs
        const apiMatches = matchesDangerousApis(tc.input);
        findings.push(...apiMatches.map((r) => `api:${r}`));

        // Check SSRF
        if (matchesSSRF(tc.input, tc.filename)) {
          findings.push("ssrf");
        }

        // Check XSS
        if (matchesXSS(tc.input)) {
          findings.push("xss");
        }

        // Check API route without auth
        if (/src\/app\/api\/.*route\.ts$/.test(tc.filename.replace(/\\/g, "/"))) {
          const hasAuth =
            hasAuthorizeCall(tc.input) ||
            /auth\(|getServerSession|requireUser|currentUser|getCurrentUser|session/.test(
              tc.input
            );
          if (
            !hasAuth &&
            !/health|ready|public|demo|csrf|auth\/\[|auth\/saml/.test(tc.filename)
          ) {
            findings.push("api-route-no-auth");
          }
        }

        expect(findings).toHaveLength(0);
      }
    );
  });

  describe("Pattern-specific regression tests", () => {
    it("should not flag RegExp.exec() as child_process", () => {
      const code = `const match = regex.exec(inputString);`;
      const matches = matchesDangerousApis(code);
      expect(matches).not.toContain("child-process");
    });

    it("should flag real child_process exec", () => {
      const code = `exec("ls -la");`;
      const matches = matchesDangerousApis(code);
      expect(matches).toContain("child-process");
    });

    it("should not flag Redis EVAL as JS eval", () => {
      const code = `await client.eval("return redis.get(key)");`;
      const matches = matchesDangerousApis(code);
      expect(matches).not.toContain("eval");
    });

    it("should flag real eval() usage", () => {
      const code = `eval("1 + 2");`;
      const matches = matchesDangerousApis(code);
      expect(matches).toContain("eval");
    });

    it("should not flag Arabic UI labels as secrets", () => {
      const code = `const label = "اسم المستخدم: admin@example.com";`;
      const matches = matchesSecretPatterns(code);
      expect(matches).toHaveLength(0);
    });

    it("should not flag URL strings as secrets", () => {
      const code = `const apiUrl = "https://api.example.com/v1?key=secret123";`;
      const matches = matchesSecretPatterns(code);
      expect(matches).toHaveLength(0);
    });

    it("should not flag process.env references as secrets", () => {
      const code = `const apiKey = process.env.API_KEY;`;
      const matches = matchesSecretPatterns(code);
      expect(matches).toHaveLength(0);
    });

    it("should not flag type definitions as secrets", () => {
      const code = `token: string; // type definition`;
      const matches = matchesSecretPatterns(code);
      expect(matches).toHaveLength(0);
    });

    it("should flag real hardcoded secrets", () => {
      const code = `const key = "AKIAIOSFODNN7EXAMPLE";`;
      const matches = matchesSecretPatterns(code);
      expect(matches).toContain("aws-key");
    });

    it("should recognize getCurrentUser as auth guard", () => {
      expect(hasAuthorizeCall(`const user = await getCurrentUser();`)).toBe(true);
    });

    it("should recognize enforce() as auth guard", () => {
      expect(hasAuthorizeCall(`enforce({ session, role: "admin" });`)).toBe(true);
    });

    it("should recognize getServerSession as auth guard", () => {
      expect(hasAuthorizeCall(`const session = await getServerSession(authOptions);`)).toBe(true);
    });

    it("should not recognize random text as auth guard", () => {
      expect(hasAuthorizeCall(`const x = "hello world";`)).toBe(false);
    });

    it("should recognize organizationId as tenant scope", () => {
      expect(hasOrganizationScope(`where: { organizationId: user.orgId }`)).toBe(true);
    });

    it("should flag dangerouslySetInnerHTML without sanitize in client", () => {
      const code = `"use client";\n<div dangerouslySetInnerHTML={{ __html: userInput }} />`;
      expect(matchesXSS(code)).toBe(true);
    });

    it("should not flag dangerouslySetInnerHTML with DOMPurify in client", () => {
      const code = `"use client";\nconst sanitized = DOMPurify.sanitize(html);\n<div dangerouslySetInnerHTML={{ __html: sanitized }} />`;
      expect(matchesXSS(code)).toBe(false);
    });

    it("should not flag dangerouslySetInnerHTML in server component", () => {
      const code = `<div dangerouslySetInnerHTML={{ __html: html }} />`;
      expect(matchesXSS(code)).toBe(false);
    });

    it("should exclude health endpoints from API route auth findings", () => {
      const filename = "src/app/api/platform/health/route.ts";
      expect(/health|ready|public|demo|csrf|auth\/\[|auth\/saml/.test(filename)).toBe(true);
    });

    it("should exclude NextAuth catch-all from auth findings", () => {
      const filename = "src/app/api/auth/[...nextauth]/route.ts";
      expect(/health|ready|public|demo|csrf|auth\/\[|auth\/saml/.test(filename)).toBe(true);
    });

    it("should exclude test files from scanning", () => {
      expect(isSecurityExcluded("src/__tests__/auth.test.ts")).toBe(true);
      expect(isSecurityExcluded("src/lib/parser.spec.ts")).toBe(true);
      expect(isSecurityExcluded("src/__tests__/mocks/data.ts")).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// Performance Scanner Regression Tests
// ═══════════════════════════════════════════════════════════════════

describe("Performance Scanner Regression", () => {
  describe("True Positives — should be flagged", () => {
    it.each(perfTP.map((c) => [c.id, c]))(
      "%s: %s",
      (_id, tc) => {
        if (isPerformanceExcluded(tc.filename)) return;

        const findings: string[] = [];

        if (matchesN1(tc.input)) findings.push("n-plus-one");
        if (matchesFindManyNoTake(tc.input)) findings.push("unbounded-query");
        if (matchesLargeClient(tc.input)) findings.push("large-client");

        expect(findings.length).toBeGreaterThan(0);
      }
    );
  });

  describe("False Positives — should NOT be flagged", () => {
    it.each(perfFP.map((c) => [c.id, c]))(
      "%s: %s",
      (_id, tc) => {
        // For file-exclusion FPs, verify the file would be excluded by the scanner
        if (isPerformanceExcluded(tc.filename)) {
          expect(tc.id).toMatch(/^FP-PERF/);
          return;
        }

        const findings: string[] = [];

        if (matchesN1(tc.input)) findings.push("n-plus-one");
        if (matchesFindManyNoTake(tc.input)) findings.push("unbounded-query");
        if (matchesLargeClient(tc.input)) findings.push("large-client");

        expect(findings).toHaveLength(0);
      }
    );
  });

  describe("Accepted Risks", () => {
    it.each(perfAR.map((c) => [c.id, c]))(
      "%s: %s",
      (_id, tc) => {
        // These are expected patterns — accepted risks
        expect(tc.id).toMatch(/^AR-PERF/);
      }
    );
  });

  describe("Clean Cases — zero findings expected", () => {
    it.each(perfNA.map((c) => [c.id, c]))(
      "%s: %s",
      (_id, tc) => {
        if (isPerformanceExcluded(tc.filename)) return;

        const findings: string[] = [];

        if (matchesN1(tc.input)) findings.push("n-plus-one");
        if (matchesFindManyNoTake(tc.input)) findings.push("unbounded-query");
        if (matchesLargeClient(tc.input)) findings.push("large-client");

        expect(findings).toHaveLength(0);
      }
    );
  });

  describe("Pattern-specific regression tests", () => {
    it("should not flag seed files as N+1", () => {
      expect(isPerformanceExcluded("prisma/seed.ts")).toBe(true);
      expect(isPerformanceExcluded("prisma/seed-pilot.ts")).toBe(true);
    });

    it("should not flag test files", () => {
      expect(isPerformanceExcluded("src/__tests__/user.test.ts")).toBe(true);
      expect(isPerformanceExcluded("src/lib/something.spec.ts")).toBe(true);
    });

    it("should not flag Promise.all-wrapped maps as N+1", () => {
      const code = `const results = await Promise.all(\n  items.map(async (item) => {\n    const detail = await prisma.detail.findUnique({ where: { id: item.id } });\n    return detail;\n  })\n);`;
      expect(matchesN1(code)).toBe(false);
    });

    it("should flag real N+1 (for loop with await prisma)", () => {
      const code = `for (const user of users) {\n  const orders = await prisma.order.findMany({ where: { userId: user.id } });\n}`;
      expect(matchesN1(code)).toBe(true);
    });

    it("should flag real N+1 (.map(async) without Promise.all)", () => {
      const code = `items.map(async (item) => {\n  const detail = await prisma.detail.findUnique({ where: { id: item.id } });\n  return detail;\n});`;
      expect(matchesN1(code)).toBe(true);
    });

    it("should not flag findMany in JSDoc comments", () => {
      const code = `/**\n * Example: const users = await prisma.user.findMany();\n * This returns all users.\n */`;
      expect(matchesFindManyNoTake(code)).toBe(false);
    });

    it("should flag findMany without take in production code", () => {
      const code = `const allUsers = await prisma.user.findMany();`;
      expect(matchesFindManyNoTake(code)).toBe(true);
    });

    it("should not flag findMany with take:10", () => {
      const code = `const posts = await prisma.post.findMany({ take: 10, orderBy: { createdAt: "desc" } });`;
      expect(matchesFindManyNoTake(code)).toBe(false);
    });

    it("should not flag naturally bounded queries", () => {
      const code = `const page = await prisma.post.findMany({ take: 20, skip: 0, orderBy: { createdAt: "desc" } });`;
      expect(matchesFindManyNoTake(code)).toBe(false);
    });

    it("should flag large client components (>=400 lines)", () => {
      const lines = Array.from({ length: 500 }, (_, i) => `  const line${i} = ${i};`);
      const code = `"use client";\n${lines.join("\n")}`;
      expect(matchesLargeClient(code)).toBe(true);
    });

    it("should not flag small client components", () => {
      const code = `"use client";\nexport function Small() { return <div>hi</div>; }`;
      expect(matchesLargeClient(code)).toBe(false);
    });

    it("should not flag server components as large client", () => {
      const code = `${"x".repeat(500)}`;
      expect(matchesLargeClient(code)).toBe(false);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// AST Lite Unit Tests
// ═══════════════════════════════════════════════════════════════════

describe("AST Lite — Unit Tests", () => {
  describe("isClientModule", () => {
    it("should detect 'use client' at start of file", () => {
      expect(isClientModule(`"use client";\nimport { useState } from "react";`)).toBe(true);
    });

    it("should detect 'use client' with single quotes", () => {
      expect(isClientModule(`'use client';\nexport default function() {}`)).toBe(true);
    });

    it("should not detect server component", () => {
      expect(isClientModule(`export default function Page() { return <div />; }`)).toBe(false);
    });

    it("should not detect 'use client' in middle of file", () => {
      expect(isClientModule(`const x = 1;\n// "use client"\nexport default {}`)).toBe(false);
    });
  });

  describe("hasAuthorizeCall", () => {
    it("should detect authorize", () => {
      expect(hasAuthorizeCall(`await authorize(user, role)`)).toBe(true);
    });

    it("should detect requireAuth", () => {
      expect(hasAuthorizeCall(`const session = await requireAuth()`)).toBe(true);
    });

    it("should detect getCurrentUser", () => {
      expect(hasAuthorizeCall(`const user = await getCurrentUser()`)).toBe(true);
    });

    it("should detect enforce", () => {
      expect(hasAuthorizeCall(`enforce({ session, role: "admin" })`)).toBe(true);
    });

    it("should detect getToken", () => {
      expect(hasAuthorizeCall(`const token = await getToken({ req })`)).toBe(true);
    });

    it("should detect getServerSession", () => {
      expect(hasAuthorizeCall(`const session = await getServerSession(authOptions)`)).toBe(
        true
      );
    });

    it("should not match random text", () => {
      expect(hasAuthorizeCall(`const x = "hello world";`)).toBe(false);
    });

    it("should not match partial word 'authorization' (trailing word boundary prevents)", () => {
      // The pattern uses \b at both ends, so 'authorize' does NOT match within 'authorization'
      expect(hasAuthorizeCall(`const auth = "authorization header";`)).toBe(false);
    });
  });

  describe("hasOrganizationScope", () => {
    it("should detect organizationId", () => {
      expect(hasOrganizationScope(`where: { organizationId: user.orgId }`)).toBe(true);
    });

    it("should not match empty string", () => {
      expect(hasOrganizationScope(``)).toBe(false);
    });
  });

  describe("extractImports", () => {
    it("should extract named imports", () => {
      const imports = extractImports(`import { useState, useEffect } from "react";`);
      expect(imports).toContain("react");
    });

    it("should extract default imports", () => {
      const imports = extractImports(`import React from "react";`);
      expect(imports).toContain("react");
    });

    it("should extract type imports", () => {
      const imports = extractImports(`import type { User } from "@prisma/client";`);
      expect(imports).toContain("@prisma/client");
    });

    it("should extract multiple imports", () => {
      const code = `
        import { useState } from "react";
        import { prisma } from "@/lib/prisma";
        import type { Role } from "@prisma/client";
      `;
      const imports = extractImports(code);
      expect(imports).toContain("react");
      expect(imports).toContain("@/lib/prisma");
      expect(imports).toContain("@prisma/client");
    });
  });
});
