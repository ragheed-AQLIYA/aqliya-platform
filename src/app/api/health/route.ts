import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as fs from "fs"
import * as path from "path"

const startTime = Date.now()

interface PkgJson {
  version?: string
}

function getBuildInfo(): { version: string; build: { commit: string; timestamp: string; environment: string } } {
  let version = "0.0.0"
  try {
    const pkgPath = path.join(process.cwd(), "package.json")
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as PkgJson
    version = pkg.version ?? "0.0.0"
  } catch {
    // fallback
  }

  return {
    version,
    build: {
      commit:
        process.env.VERCEL_GIT_COMMIT_SHA ??
        process.env.GIT_SHA ??
        "development",
      timestamp: process.env.BUILD_TIMESTAMP ?? new Date(startTime).toISOString(),
      environment: process.env.NODE_ENV ?? "development",
    },
  }
}

interface CheckResult {
  ok: boolean
  detail?: string
  latencyMs?: number
}

async function livenessChecks(): Promise<{
  checks: Record<string, CheckResult>
  failed: string[]
}> {
  const checks: Record<string, CheckResult> = {}
  const failed: string[] = []

  const dbStart = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = { ok: true, latencyMs: Date.now() - dbStart }
  } catch (error) {
    checks.database = {
      ok: false,
      detail: error instanceof Error ? error.message : "connection failed",
      latencyMs: Date.now() - dbStart,
    }
    failed.push("database")
  }

  const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  if (authSecret) {
    checks.auth_secret = { ok: true }
    if (authSecret.length < 32) {
      checks.auth_secret.detail =
        "less than 32 characters (recommended minimum)"
    }
  } else {
    checks.auth_secret = { ok: false, detail: "AUTH_SECRET is not set" }
    failed.push("auth_secret")
  }

  return { checks, failed }
}

export async function GET() {
  const responseStart = Date.now()
  const buildInfo = getBuildInfo()
  const { checks, failed } = await livenessChecks()

  const status = failed.length === 0 ? "ok" : "degraded"

  return NextResponse.json(
    {
      status,
      ...buildInfo,
      checks,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      responseTimeMs: Date.now() - responseStart,
      note: "Enterprise health endpoint — liveness check",
    },
    { status: status === "ok" ? 200 : 503 },
  )
}
