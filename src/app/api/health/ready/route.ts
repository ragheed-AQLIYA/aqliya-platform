import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkLocalStorageWritable } from "@/lib/platform/runtime-env-check"
import { isPgvectorAvailable } from "@/lib/platform/pgvector-compat"
import { isRedisAvailable } from "@/lib/platform/redis-client"
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
  version?: string
}

async function readinessChecks(): Promise<{
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

  const storageProvider =
    (process.env.STORAGE_PROVIDER as string | undefined) ?? "local"
  if (storageProvider === "local") {
    const storage = await checkLocalStorageWritable()
    checks.storage = {
      ok: storage.ok,
      detail: storage.ok
        ? `writable (${storage.path})`
        : `${storage.path} — ${storage.detail ?? "unknown error"}`,
    }
    if (!storage.ok) failed.push("storage")
  } else if (storageProvider === "s3") {
    const s3Bucket = process.env.S3_BUCKET
    const s3Endpoint = process.env.S3_ENDPOINT
    const hasS3Config = !!(s3Bucket && s3Endpoint)
    checks.storage = {
      ok: hasS3Config,
      detail: hasS3Config
        ? `configured (bucket: ${s3Bucket})`
        : "S3_BUCKET or S3_ENDPOINT not configured",
    }
    if (!hasS3Config) failed.push("storage")
  } else {
    checks.storage = {
      ok: false,
      detail: `${storageProvider} provider not integrated for v0.1`,
    }
    failed.push("storage")
  }

  try {
    const pgvectorOk = await isPgvectorAvailable()
    checks.pgvector = {
      ok: pgvectorOk,
      detail: pgvectorOk ? "available" : "pgvector extension not found",
    }
    if (!pgvectorOk) failed.push("pgvector")
  } catch (error) {
    checks.pgvector = {
      ok: false,
      detail: error instanceof Error ? error.message : "pgvector check failed",
    }
    failed.push("pgvector")
  }

  const redisUrl = process.env.REDIS_URL
  if (redisUrl) {
    const redisStart = Date.now()
    try {
      const redisOk = await isRedisAvailable()
      checks.redis = {
        ok: redisOk,
        latencyMs: Date.now() - redisStart,
        detail: redisOk ? "connected" : "connection failed",
      }
      if (!redisOk) failed.push("redis")
    } catch (error) {
      checks.redis = {
        ok: false,
        detail: error instanceof Error ? error.message : "redis check failed",
        latencyMs: Date.now() - redisStart,
      }
      failed.push("redis")
    }
  } else {
    checks.redis = {
      ok: true,
      detail: "not configured (REDIS_URL not set)",
    }
  }

  if (process.env.FF_AI_REAL_PROVIDERS === "true") {
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY
    if (hasOpenAI || hasAnthropic) {
      const providers: string[] = []
      if (hasOpenAI) providers.push("openai")
      if (hasAnthropic) providers.push("anthropic")
      checks.ai_provider = {
        ok: true,
        detail: `configured (${providers.join(", ")})`,
      }
    } else {
      checks.ai_provider = {
        ok: false,
        detail:
          "FF_AI_REAL_PROVIDERS=true but no API key set (OPENAI_API_KEY or ANTHROPIC_API_KEY)",
      }
      failed.push("ai_provider")
    }
  } else {
    checks.ai_provider = {
      ok: true,
      detail: "not enabled (FF_AI_REAL_PROVIDERS not set)",
    }
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
  const { checks, failed } = await readinessChecks()

  const status = failed.length === 0 ? "ok" : "degraded"

  return NextResponse.json(
    {
      status,
      ...buildInfo,
      checks,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      responseTimeMs: Date.now() - responseStart,
      note: "Enterprise health endpoint — readiness check",
    },
    { status: status === "ok" ? 200 : 503 },
  )
}
