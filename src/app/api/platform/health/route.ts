import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CheckResult = {
  status: "ok" | "error";
  latencyMs?: number;
  error?: string;
};

/**
 * Platform health check endpoint.
 * Returns 200 when all checks pass, 503 when any check fails.
 * Safe for load balancers and uptime monitors (no auth required).
 */
export async function GET() {
  const checks: Record<string, CheckResult> = {};

  // Database connectivity check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "ok", latencyMs: Date.now() - dbStart };
  } catch (e) {
    checks.database = {
      status: "error",
      latencyMs: Date.now() - dbStart,
      error: e instanceof Error ? e.message : "Unknown database error",
    };
  }

  // Overall status: healthy only if ALL checks pass
  const overall = Object.values(checks).every((c) => c.status === "ok")
    ? "healthy"
    : "degraded";

  return NextResponse.json(
    {
      status: overall,
      timestamp: new Date().toISOString(),
      checks,
      version: "0.1.0",
    },
    {
      status: overall === "healthy" ? 200 : 503,
    },
  );
}
