/**
 * Agent 2 — Security
 * Heuristic review: auth, authz, secrets, CSRF, XSS, SQLi, SSRF,
 * headers, rate limiting, cookies, OWASP Top 10 mapping.
 * Findings only — not a penetration test.
 */

import { SECURITY, buildExclusionFn } from "../config.mjs";
import {
  collectSourceFiles,
  readText,
  rel,
  exists,
  abs,
} from "../lib/fs-utils.mjs";
import { finding, scoreFromFindings } from "../lib/findings.mjs";
import { writeAgentReport } from "../lib/report.mjs";
import { isClientModule, hasAuthorizeCall, hasOrganizationScope } from "../lib/ast-lite.mjs";

/** Security scanner excludes tests + mocks (seeds may contain real secrets) */
const isExcluded = buildExclusionFn("security");

const AGENT = "security";

const OWASP = {
  A01: "Broken Access Control",
  A02: "Cryptographic Failures",
  A03: "Injection",
  A04: "Insecure Design",
  A05: "Security Misconfiguration",
  A06: "Vulnerable Components",
  A07: "Identification and Authentication Failures",
  A08: "Software and Data Integrity Failures",
  A09: "Security Logging Failures",
  A10: "Server-Side Request Forgery (SSRF)",
};

export async function run() {
  const findings = [];
  const files = collectSourceFiles(["src"]);

  // Structural presence checks
  const middleware = exists(abs("src/middleware.ts")) || exists(abs("src/proxy.ts"));
  if (!middleware) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "critical",
        category: "A05",
        title: "No middleware/proxy auth edge found",
        evidence: "Expected src/middleware.ts or src/proxy.ts",
        files: [],
        suggestion: "Ensure Next.js edge auth matcher covers private routes.",
      })
    );
  } else {
    const mw = readText(abs("src/middleware.ts")) || readText(abs("src/proxy.ts")) || "";
    if (!/matcher|authorized|auth|NextAuth|getToken/.test(mw)) {
      findings.push(
        finding({
          agent: AGENT,
          severity: "high",
          category: "A07",
          title: "Middleware may lack auth enforcement signals",
          evidence: "Auth-related keywords sparse in middleware/proxy",
          files: [exists(abs("src/middleware.ts")) ? "src/middleware.ts" : "src/proxy.ts"],
        })
      );
    }
    if (!/csrf|CSRF/.test(mw) && !exists(abs("src/lib/security"))) {
      // informational — NextAuth often handles CSRF
      findings.push(
        finding({
          agent: AGENT,
          severity: "info",
          category: "A01",
          title: "CSRF handling not obvious in middleware",
          evidence: "Rely on NextAuth/framework CSRF; verify login + mutation paths",
          files: [],
        })
      );
    }
  }

  // Rate limiting presence
  const rateLimitFiles = files.filter((f) => /rate-?limit/i.test(rel(f)));
  if (!rateLimitFiles.length) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "medium",
        category: "A05",
        title: "No rate-limit module path detected under src",
        evidence: "Search for rate-limit* returned empty",
        suggestion: "Confirm RATE_LIMITER env + redis/memory implementation still wired.",
      })
    );
  }

  // Headers / CSP
  const nextConfig =
    readText(abs("next.config.mjs")) ||
    readText(abs("next.config.js")) ||
    readText(abs("next.config.ts")) ||
    "";
  if (nextConfig && !/Content-Security-Policy|contentSecurityPolicy|headers\s*\(/.test(nextConfig)) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "medium",
        category: "A05",
        title: "CSP / security headers not obvious in next.config",
        evidence: "No Content-Security-Policy string found in next config",
        files: ["next.config.mjs"],
      })
    );
  }
  if (nextConfig && /unsafe-eval/.test(nextConfig)) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "high",
        category: "A05",
        title: "CSP allows unsafe-eval",
        evidence: "unsafe-eval present in next config",
        files: ["next.config.mjs"],
        suggestion: "Remove unsafe-eval unless a documented exception exists.",
      })
    );
  }

  // Cookie configuration signals
  const authLib = readText(abs("src/lib/auth.ts")) || "";
  if (authLib) {
    if (!/httpOnly|sameSite|secure/i.test(authLib)) {
      findings.push(
        finding({
          agent: AGENT,
          severity: "medium",
          category: "A07",
          title: "Cookie security flags not obvious in auth module",
          evidence: "httpOnly/sameSite/secure not clearly referenced in src/lib/auth.ts",
          files: ["src/lib/auth.ts"],
        })
      );
    }
  }

  // Per-file scans
  const apiRoutes = [];
  const actions = [];

  for (const absFile of files) {
    const fileRel = rel(absFile);
    const content = readText(absFile);
    if (!content) continue;

    // Skip excluded files (tests, seeds, mocks, fixtures)
    if (isExcluded(fileRel)) continue;

    // Secrets
    for (const pat of SECURITY.secretPatterns) {
      if (pat.re.test(content)) {
        // Apply per-pattern exclusions
        if (pat.exclude && pat.exclude.test(content)) continue;
        findings.push(
          finding({
            agent: AGENT,
            severity: pat.severity,
            category: "A02",
            title: `Possible secret material (${pat.id})`,
            evidence: `Pattern ${pat.id} matched`,
            files: [fileRel],
            suggestion: "Move to env/Secrets Manager; rotate if real.",
          })
        );
      }
    }

    // Dangerous APIs
    for (const pat of SECURITY.dangerousApis) {
      if (pat.re.test(content)) {
        findings.push(
          finding({
            agent: AGENT,
            severity: pat.severity,
            category: pat.id === "raw-sql" ? "A03" : pat.id.includes("HTML") ? "A03" : "A04",
            title: `Dangerous API usage: ${pat.id}`,
            evidence: `Matched ${pat.id}`,
            files: [fileRel],
            suggestion:
              pat.id === "raw-sql"
                ? "Prefer parameterized Prisma queries; audit any RawUnsafe."
                : "Sanitize / avoid; prefer safe framework APIs.",
          })
        );
      }
    }

    // SSRF — fetch with user-controlled URL heuristics
    if (/fetch\s*\(\s*[a-zA-Z_][\w.]*\s*[,)]/.test(content) && /req\.|searchParams|body\.|input\./.test(content)) {
      // Exclude if the fetch URL comes from an environment variable (not user input)
      const fetchVarMatch = content.match(/fetch\s*\(\s*([a-zA-Z_][\w.]*)\s*[,)]/);
      const urlFromEnv = fetchVarMatch && content.includes(`${fetchVarMatch[1]} = process.env`);
      if (!urlFromEnv && /api\/|actions\//.test(fileRel)) {
        findings.push(
          finding({
            agent: AGENT,
            severity: "medium",
            category: "A10",
            title: "Possible SSRF: fetch with dynamic input",
            evidence: "fetch(variable) near request/input usage",
            files: [fileRel],
            suggestion: "Allowlist hosts; block link-local/metadata IPs.",
          })
        );
      }
    }

    // API routes without auth signals
    if (/src\/app\/api\/.*route\.ts$/.test(fileRel.replace(/\\/g, "/"))) {
      apiRoutes.push(fileRel);
      const hasAuth =
        hasAuthorizeCall(content) ||
        /auth\(|getServerSession|requireUser|currentUser|getCurrentUser|session/.test(content);
      if (!hasAuth && !/health|ready|public|demo|csrf|auth\/\[|auth\/saml/.test(fileRel)) {
        findings.push(
          finding({
            agent: AGENT,
            severity: "high",
            category: "A01",
            title: "API route may lack auth check",
            evidence: "No authorize/session guard keywords detected",
            files: [fileRel],
            suggestion: "Add server-side auth + tenant checks; return 401/404 safely.",
          })
        );
      }
      if (/download|export/i.test(fileRel) && !hasOrganizationScope(content)) {
        findings.push(
          finding({
            agent: AGENT,
            severity: "high",
            category: "A01",
            title: "Download/export route may lack tenant scope",
            evidence: "organizationId not referenced",
            files: [fileRel],
          })
        );
      }
    }

    // Server actions — only flag if file has mutations and no guard at all
    if (fileRel.startsWith("src/actions/") && fileRel.endsWith(".ts")) {
      actions.push(fileRel);
      const looksMutating = /prisma\.\w+\.(create|update|delete|upsert)/.test(content);
      if (
        looksMutating &&
        !hasAuthorizeCall(content) &&
        !/__tests__/.test(fileRel) &&
        actions.filter((a) => a === fileRel).length === 1
      ) {
        // cap later via sampling
        findings.push(
          finding({
            agent: AGENT,
            severity: "medium",
            category: "A01",
            title: "Mutating server action may lack explicit authorize guard",
            evidence: "Prisma write without authorize/guard keyword detected",
            files: [fileRel],
            suggestion: "Use shared action-guard / authorize() pattern.",
          })
        );
      }
    }

    // XSS — client dangerouslySetInnerHTML without sanitize mention
    if (isClientModule(content) && /dangerouslySetInnerHTML/.test(content) && !/DOMPurify|sanitize/.test(content)) {
      findings.push(
        finding({
          agent: AGENT,
          severity: "medium",
          category: "A03",
          title: "dangerouslySetInnerHTML without sanitize signal",
          evidence: "Client component sets HTML without DOMPurify/sanitize",
          files: [fileRel],
        })
      );
    }
  }

  // .env committed check
  if (exists(abs(".env")) && !exists(abs(".env.example"))) {
    findings.push(
      finding({
        agent: AGENT,
        severity: "info",
        category: "A05",
        title: ".env present — ensure it is gitignored",
        evidence: ".env exists at repo root",
        files: [".env"],
      })
    );
  }

  // Cap noisy medium findings from actions — keep top by severity already ordered
  const score = scoreFromFindings(findings, { base: 100 });

  const owaspTable = Object.entries(OWASP)
    .map(([k, v]) => {
      const count = findings.filter((f) => f.category === k).length;
      return `| ${k} | ${v} | ${count} |`;
    })
    .join("\n");

  return writeAgentReport({
    name: AGENT,
    title: "Security Report",
    score,
    findings,
    sections: [
      {
        heading: "Disclaimer",
        body: "Heuristic static review mapped to OWASP Top 10. **Not** a penetration test, SAST license scan, or production attestation.",
      },
      {
        heading: "OWASP Top 10 Coverage (finding counts)",
        body: `| ID | Category | Findings |\n| -- | -------- | -------- |\n${owaspTable}`,
      },
      {
        heading: "Surface Scanned",
        body: `- Source files: ${files.length}\n- API routes sampled: ${apiRoutes.length}\n- Server action modules: ${actions.length}\n- Rate-limit modules: ${rateLimitFiles.length}`,
      },
    ],
    meta: {
      owasp: OWASP,
      apiRoutes: apiRoutes.length,
      actions: actions.length,
    },
  });
}
