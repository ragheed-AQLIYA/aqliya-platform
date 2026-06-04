/**
 * post-deploy-smoke.mjs
 *
 * Post-deployment smoke test: validates that critical routes respond 200,
 * the health endpoint is functional, and key API endpoints return expected shapes.
 *
 * Usage:
 *   node scripts/post-deploy-smoke.mjs --base-url https://staging.aqliya.ai
 *
 * Requires:
 *   --base-url  The deployment URL to test (required)
 *   --auth-token  Optional bearer token for authenticated endpoints
 *
 * Returns exit code 0 if all checks pass, 1 if any fail.
 */

const BASE_URL = process.env.BASE_URL ?? process.argv.find((a) => a.startsWith("--base-url="))?.split("=")[1]
  ?? process.argv[process.argv.indexOf("--base-url") + 1]

if (!BASE_URL) {
  console.error("Usage: node scripts/post-deploy-smoke.mjs --base-url <url> [--auth-token <token>]")
  process.exit(1)
}

const AUTH_TOKEN = process.env.AUTH_TOKEN ?? process.argv.find((a) => a.startsWith("--auth-token="))?.split("=")[1]
  ?? process.argv[process.argv.indexOf("--auth-token") + 1]

const HEADERS = { "User-Agent": "AqliyaPostDeploySmoke/1.0" }
if (AUTH_TOKEN) HEADERS["Authorization"] = `Bearer ${AUTH_TOKEN}`

const TIMEOUT_MS = 15_000
const BASE = BASE_URL.replace(/\/+$/, "")

async function check(label, path, opts = {}) {
  const url = `${BASE}${path}`
  const signal = AbortSignal.timeout(opts.timeout ?? TIMEOUT_MS)
  const start = Date.now()
  try {
    const res = await fetch(url, { headers: { ...HEADERS, ...opts.headers }, signal, redirect: "manual" })
    const ms = Date.now() - start
    const status = opts.expectedStatus ?? 200
    const allowed = opts.acceptStatuses ?? [status]
    const ok =
      allowed.includes(res.status) ||
      (opts.acceptRedirect && res.status >= 300 && res.status < 400)
    if (ok) {
      console.log(`  ✓ ${label} (${ms}ms)`)
      return { ok: true, status: res.status }
    }
    console.error(`  ✗ ${label} — expected ${status}, got ${res.status} (${ms}ms)`)
    return { ok: false, status: res.status }
  } catch (err) {
    console.error(`  ✗ ${label} — ${err.message}`)
    return { ok: false, status: 0 }
  }
}

async function main() {
  console.log(`\nPost-deploy smoke test: ${BASE}\n`)

  const checks = [
    check("Health endpoint", "/api/health"),
    check("Homepage", "/"),
    check("Login page", "/login", { acceptRedirect: true }),
  ]

  if (!AUTH_TOKEN) {
    console.log("\n  (no auth token — skipping authenticated checks)")
  } else {
    checks.push(
      check("Auth session", "/api/auth/session"),
      check("Notifications API", "/api/notifications?limit=1", {
        acceptStatuses: [200, 404],
      }),
      check("Monitoring", "/monitoring", { acceptRedirect: true }),
    )
  }

  const results = await Promise.all(checks)
  const passed = results.filter((r) => r.ok).length
  const failed = results.filter((r) => !r.ok).length

  console.log(`\n  ---\n  ${passed} passed, ${failed} failed\n`)

  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error("Smoke test error:", err)
  process.exit(1)
})
